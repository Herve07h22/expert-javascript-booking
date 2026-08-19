import { Context } from "./Context.js";
import { Rollback } from "./Rollback.js";

export class App {
  constructor(dependencies, subscribers = {}) {
    this.dependencies = dependencies;
    this.subscribers = subscribers;
  }

  async run(usecases) {
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
    // Une transaction ne contient que des écritures annulables.
    if (context.isOk()) {
      await this.publish(context.events);
    }
    return context;
  }

  async publish(events) {
    for (const event of events) {
      for (const subscriber of this.subscribers[event.type] ?? []) {
        try {
          await subscriber(event, this.dependencies);
        } catch (error) {
          // Un abonné qui échoue ne défait pas ce qui a été fait.
          this.dependencies.logger?.error("subscriber failed", {
            event: event.type,
            error,
          });
        }
      }
    }
  }
}
