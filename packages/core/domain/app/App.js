import { Context } from "./Context.js";

export class App {
  constructor(dependencies, subscribers = {}) {
    this.dependencies = dependencies;
    this.subscribers = subscribers;
  }

  async run(usecases) {
    let context = new Context();
    for (const usecase of usecases) {
      // Inutile de continuer en cas d'erreur
      if (context.isOk()) {
        context = await usecase(this.dependencies, context);
      }
    }

    // On publie ce qui est ACQUIS : rien si le scénario a échoué.
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
