const { ipcRenderer } = require("electron");
const { fromEventPattern } = require("rxjs");

/**
 *
 * @param {string} message
 * @returns any
 */
const SYNC_MESSAGE_EVENT = "synchronous-message";
function sendSyncMessage(message) {
  const syncback = ipcRenderer.sendSync(SYNC_MESSAGE_EVENT, message);
  return syncback;
}

/**
 *
 * @param {string} eventName
 * @returns Observable
 */
function fromAsyncReply(eventName) {
  return fromEventPattern(
    (handler) => {
      ipcRenderer.on(eventName, handler);
    },
    (handler) => {
      ipcRenderer.off(eventName, handler);
    }
  );
}

/**
 *
 * @param {string} message
 */
const ASYNC_MESSAGE_EVENT = "asynchronous-message";
function sendAsyncMessage(message) {
  ipcRenderer.send(ASYNC_MESSAGE_EVENT, message);
}

module.exports = {
  sendSyncMessage,
  fromAsyncReply,
  sendAsyncMessage,
};
