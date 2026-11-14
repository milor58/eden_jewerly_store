/* © 2026 Eden Jewelry. All rights reserved. */
// Throw this from any route: the error middleware turns it into JSON.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
