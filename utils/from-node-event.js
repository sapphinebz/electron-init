const { Observable } = require("rxjs");
/**
 *
 * @param {NodeStyleEventEmitter} app
 * @param {string} eventName
 * @returns Observable
 */
function fromNodeEvent(app, eventName) {
  return new Observable((subscriber) => {
    const handler = (event) => subscriber.next(event);
    app.on(eventName, handler);
    return () => app.off(eventName, handler);
  });
}
/**
 *
 * @param {NodeStyleEventEmitter} app
 * @param {string} eventName
 * @returns Promise
 */
function fromNodeEventPromise(app, eventName) {
  return new Promise((resolve, reject) => {
    const handler = (event) => resolve(event);
    app.once(eventName, handler);
  });
}

module.exports = { fromNodeEvent, fromNodeEventPromise };
