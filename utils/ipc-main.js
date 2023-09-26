const { ipcMain } = require("electron");
const { fromEventPattern, Observable } = require("rxjs");

function sendToIPCRenderer(win, channel, value) {
  win.webContents.send(channel, value);
}
/**
 * for synchronous
 * event.returnValue = "sync pong";
 * for asynchronous
 * event.sender.send(channel, "async pong");
 * legacy way
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

/**
 * two way communicate
 * @param { string} channel
 * @param {Promise} promise
 * @returns Observable
 */
function listenInvoke(channel, promise) {
  return new Observable((subscriber) => {
    ipcMain.handle(
      channel,
      promise.then((value) => {
        subscriber.next(value);
        subscriber.complete();
        return value;
      })
    );
    return () => {
      ipcMain.removeHandler(channel);
    };
  });
}

module.exports = {
  listenIPCRenderer,
  listenInvoke,
  sendToIPCRenderer,
};
