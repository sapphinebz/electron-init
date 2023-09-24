const { ipcMain } = require("electron");
const { fromEventPattern } = require("rxjs");

/**
 * for synchronous
 * event.returnValue = "sync pong";
 * for asynchronous
 * event.sender.send(channel, "async pong");
 * @param {*} channel
 * @returns Observable
 */
function listenIPCRenderer(channel) {
  return fromEventPattern(
    (handler) => {
      ipcMain.on(channel, handler);
    },
    (handler) => ipcMain.off(channel, handler)
  );
}

module.exports = {
  listenIPCRenderer,
};
