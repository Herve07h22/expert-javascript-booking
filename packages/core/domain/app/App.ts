import { Context } from "./Context.js";
import { Rollback } from "./Rollback.js";
import type { Dependencies, Subscribers, UseCase } from "../ports.js";

export class App {
  readonly dependencies: Dependencies;
  readonly subscribers: Subscribers;

  constructor(dependencies: Dependencies, subscribers: Subscribers = {}) {
    this.dependencies = dependencies;
    this.subscribers = subscribers;
  }

  async run(usecases: UseCase[]): Promise<Context> {
    const context = await this.dependencies.unitOfWork.run(
      async (dependencies) => {
        let context = new Context();
        for (const usecase of usecases) {
          // Inutile de continuer en cas d'erreur
          if (context.isOk()) {
            context = await usecase(dependencies, context);
          }
        }
        // Une erreur métier annule aussi ce qui a été écrit avant elle.
        if (!context.isOk()) {
          throw new Rollback(context);
        }
        return context;
      }
    );

    // Publication APRÈS la validation, jamais avant.
    if (context.isOk()) {
      await this.publish(context);
    }
    return context;
  }

  private async publish(context: Context): Promise<void> {
    for (const event of context.events) {
      for (const subscriber of this.subscribers[event.type] ?? []) {
        try {
          await subscriber(event, this.dependencies);
        } catch (error) {
          // Un abonné qui échoue ne défait pas ce qui a été fait.
          this.dependencies.logger.error(
            { event: event.type, error },
            "subscriber failed"
          );
        }
      }
    }
  }
}
