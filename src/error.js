export class InvalidFormatError extends Error {
  constructor(...args) {
    super(...args);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidFormatError);
    }
    this.name = 'InvalidFormatError';
  }
}

export class InvalidFiltererError extends Error {
  constructor(...args) {
    super(...args);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidFiltererError);
    }
    this.name = 'InvalidFiltererError';
  }
}
