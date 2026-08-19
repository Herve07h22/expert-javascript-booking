import { Rollback } from "./Rollback.js";

/**
 * En mémoire, il n'y a rien à valider ni à annuler. Mais il y a mieux à faire
 * que ne rien faire : la boucle d'événements est mono-thread, alors on
 * sérialise les scénarios. C'est le sémaphore du chapitre 6.
 *
 * Grossier — deux logements différents s'attendent inutilement — mais dans
 * une suite de tests cela ne coûte rien, et cela donne la garantie qu'il faut.
 */
export class MemoryUnitOfWork {
  constructor(dependencies) {
    this._dependencies = dependencies;
    this._queue = Promise.resolve();
  }

  run(work) {
    const result = this._queue.then(() => work(this._dependencies));
    this._queue = result.catch(() => {}); // un échec ne bloque pas la file
    return result.catch((error) => {
      if (error instanceof Rollback) return error.context;
      throw error;
    });
  }
}
