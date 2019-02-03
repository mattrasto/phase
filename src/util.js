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

export class Logger {
  constructor(debug) {
    this.debug = debug;
  }

  log(message) {
    if (this.debug) console.log(message); // eslint-disable-line no-console
  }

  warn(message) {
    if (this.debug) console.warn(message); // eslint-disable-line no-console
  }

  error(message) {
    if (this.debug) console.error(message); // eslint-disable-line no-console
  }
}
