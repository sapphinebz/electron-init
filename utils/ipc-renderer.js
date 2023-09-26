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
function listenIPCMain(eventName) {
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

function sendToIPCMain(channel, message = "") {
  ipcRenderer.send(channel, message);
}

/**
 * two-way communication
 * @param {string} channel
 * @param { any } arg
 * @returns Promise
 */
function invoke(channel, arg) {
  return ipcRenderer.invoke(channel, arg);
}

module.exports = {
  sendSyncMessage,
  listenIPCMain,
  sendToIPCMain,
  invoke,
};
