const { ipcRenderer } = require("electron");
const { fromEventPattern } = require("rxjs");

/**
 * @param {string} channel
 * @param {string} message
 * @returns any
 */
function sendSyncMessage(channel, message) {
  const syncback = ipcRenderer.sendSync(channel, message);
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
 * @param {string} channel
 * @param {string} message
 */

function sendAsyncMessage(channel, message) {
  ipcRenderer.send(channel, message);
}

module.exports = {
  sendSyncMessage,
  fromAsyncReply,
  sendAsyncMessage,
};
