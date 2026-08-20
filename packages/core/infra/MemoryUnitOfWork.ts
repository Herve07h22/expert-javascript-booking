import { Rollback } from "../domain/app/Rollback.js";
import type { Context } from "../domain/app/Context.js";
import type { Dependencies, UnitOfWork } from "../domain/ports.js";

/**
 * En mémoire, il n'y a rien à valider ni à annuler. Mais il y a mieux à faire
 * que ne rien faire : la boucle d'événements est mono-thread, alors on
 * sérialise les scénarios. C'est le sémaphore du chapitre 6.
 */
export class MemoryUnitOfWork implements UnitOfWork {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly dependencies: Dependencies) {}

  run(work: (dependencies: Dependencies) => Promise<Context>): Promise<Context> {
    const result = this.queue.then(() => work(this.dependencies));
    this.queue = result.catch(() => {}); // un échec ne bloque pas la file
    return result.catch((error: unknown) => {
      if (error instanceof Rollback) return error.context;
      throw error;
    });
  }
}
