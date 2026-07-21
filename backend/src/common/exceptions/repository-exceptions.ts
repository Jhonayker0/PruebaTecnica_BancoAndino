export class DuplicateEntityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateEntityError';
  }
}

export class EntityNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EntityNotFoundError';
  }
}

export class RestrictedEntityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RestrictedEntityError';
  }
}
