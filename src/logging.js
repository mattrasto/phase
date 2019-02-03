export default class Logger {
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
