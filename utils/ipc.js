const { ipcMain } = require("electron");
const { fromEventPattern } = require("rxjs");
const { share } = require("rxjs/operators");

// Event handler for asynchronous incoming messages
const ASYNC_MESSAGE_EVENT = "asynchronous-message";
const onIPCMainAsyncMessage = fromEventPattern(
  (handler) => {
    ipcMain.on(ASYNC_MESSAGE_EVENT, handler);
    return () => ipcMain.off(ASYNC_MESSAGE_EVENT, handler);
  },
  (handler, cleanup) => cleanup()
).pipe(share());

// Event handler for synchronous incoming messages
const SYNC_MESSAGE_EVENT = "synchronous-message";
const onIPCMainSyncMessage = fromEventPattern(
  (handler) => {
    ipcMain.on(SYNC_MESSAGE_EVENT, handler);
    return () => ipcMain.off(SYNC_MESSAGE_EVENT, handler);
  },
  (handler, cleanup) => cleanup()
).pipe(share());

module.exports = {
  onIPCMainAsyncMessage,
  onIPCMainSyncMessage,
};

// onIPCMainAsyncMessage.subscribe(([event, arg]) => {
//     console.log("onIPCMainMessage", value);

//     //   // Event emitter for sending asynchronous messages
//     //   event.sender.send("asynchronous-reply", "async pong");
//   });

//   onIPCMainSyncMessage.subscribe(([event, arg]) => {
//     console.log(arg);

//     // Synchronous event emmision
//     event.returnValue = "sync pong";
//   });
