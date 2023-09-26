const { ipcRenderer } = require("electron");
const { fromEventPattern } = require("rxjs");

/**
 * @param {string} channel
 * @param {string} message
 * @returns any
 */
function sendSyncToIPCMain(channel, message) {
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

module.exports = {
  sendSyncToIPCMain,
  listenIPCMain,
  sendToIPCMain,
};
