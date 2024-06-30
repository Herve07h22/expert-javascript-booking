import { Context } from "./Context";

export class App {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }
  async run(usecases) {
    var context = new Context();
    for (const usecase of usecases) {
      // Inutile de continuer en cas d'erreur
      if (context.isOk()) {
        context = await usecase(this.dependencies, context);
      }
    }
    return context;
  }
}
