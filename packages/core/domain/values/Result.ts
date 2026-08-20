import type { DomainErrorShape } from "../errors.js";

/**
 * Soit une valeur, soit la raison de l'échec.
 *
 * `isOk(): this is ...` est un PRÉDICAT DE TYPE : sans lui, le compilateur ne
 * saurait pas qu'après un `if (r.isError()) return`, la valeur existe.
 */
export class Result<T, E = DomainErrorShape> {
  readonly #value: T | null;
  readonly #error: E | null;

  private constructor(value: T | null, error: E | null) {
    this.#value = value;
    this.#error = error;
    Object.freeze(this);
  }

  static ok<T>(value: T): Result<T, never> {
    return new Result<T, never>(value, null);
  }

  static error<E>(error: E): Result<never, E> {
    return new Result<never, E>(null, error);
  }

  /**
   * Le seul `as` du fichier, et il est assumé : l'invariant est tenu par le
   * constructeur privé — une valeur nulle implique une erreur non nulle.
   */
  get value(): T {
    return this.#value as T;
  }

  get error(): E {
    return this.#error as E;
  }

  isOk(): boolean {
    return this.#error === null;
  }

  isError(): boolean {
    return this.#error !== null;
  }

  /** Transforme la valeur si elle existe, propage l'erreur sinon. */
  map<U>(fn: (value: T) => U): Result<U, E> {
    return this.#error !== null
      ? Result.error(this.#error)
      : Result.ok(fn(this.#value as T));
  }

  /** Enchaîne une opération qui retourne elle-même un Result. */
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.#error !== null
      ? Result.error(this.#error)
      : fn(this.#value as T);
  }
}
