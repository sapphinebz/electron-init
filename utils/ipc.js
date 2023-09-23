const { ipcMain } = require("electron");
const { fromEventPattern } = require("rxjs");
const { share, filter } = require("rxjs/operators");

// Event handler for asynchronous incoming messages
const ASYNC_MESSAGE_EVENT = "asynchronous-message";
const onIPCMainAsyncMessage = fromEventPattern(
  (handler) => {
    ipcMain.on(ASYNC_MESSAGE_EVENT, handler);
    return () => ipcMain.off(ASYNC_MESSAGE_EVENT, handler);
  },
  (handler, cleanup) => cleanup()
).pipe(share());

/**
 * @param {(message: string) => any} predicate
 * @returns
 */
function fromIPCAsyncArg(equalityArg) {
  return onIPCMainAsyncMessage.pipe(
    filter(([event, arg]) => arg === equalityArg)
  );
}

// Event handler for synchronous incoming messages
const SYNC_MESSAGE_EVENT = "synchronous-message";
const onIPCMainSyncMessage = fromEventPattern(
  (handler) => {
    ipcMain.on(SYNC_MESSAGE_EVENT, handler);
    return () => ipcMain.off(SYNC_MESSAGE_EVENT, handler);
  },
  (handler, cleanup) => cleanup()
).pipe(share());

// onIPCMainSyncMessage.subscribe(([event, arg]) => {
//   console.log(arg);
//   setTimeout(() => {
//     event.returnValue = "sync pong";
//   }, 1000);
// });

module.exports = {
  onIPCMainAsyncMessage,
  onIPCMainSyncMessage,
  fromIPCAsyncArg,
};
