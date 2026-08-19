/**
 * Le résultat d'une opération qui peut échouer : soit une valeur, soit une erreur.
 *
 * C'est ce que le chapitre 14 appelait `Maybe`. Le nom était impropre :
 * un `Maybe` répond "il y a quelque chose, ou rien du tout", sans dire pourquoi.
 * Ici on veut la raison de l'échec, donc c'est un `Result` (ou `Either`).
 */
export class Result {
  #value;
  #error;

  constructor(value, error) {
    this.#value = value;
    this.#error = error;
    Object.freeze(this);
  }

  static ok(value) {
    return new Result(value, null);
  }

  static error(error) {
    return new Result(null, error);
  }

  get value() {
    return this.#value;
  }

  get error() {
    return this.#error;
  }

  isError() {
    return this.#error !== null;
  }

  isOk() {
    return this.#error === null;
  }

  /** Transforme la valeur si elle existe, propage l'erreur sinon. */
  map(fn) {
    return this.isError() ? this : Result.ok(fn(this.#value));
  }

  /** Enchaîne une opération qui retourne elle-même un Result. */
  flatMap(fn) {
    return this.isError() ? this : fn(this.#value);
  }
}
