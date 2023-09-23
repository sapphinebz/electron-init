const { app, BrowserWindow } = require("electron");
const { merge } = require("rxjs");
const path = require("node:path");
const { share, switchMap, tap, filter } = require("rxjs/operators");
const { fromNodeEvent } = require("./utils/from-node-event");
const { listenShortcutKey } = require("./utils/shortcut-key");
const {
  onIPCMainAsyncMessage,
  onIPCMainSyncMessage,
  fromIPCAsyncArg,
} = require("./utils/ipc");
const { pptGetGoldTrader } = require("./utils/puppeteer");

// main process กับ renderer process

const GET_GOLD_EVENT = "get-gold";
fromIPCAsyncArg(GET_GOLD_EVENT)
  .pipe(
    switchMap(([event, arg]) => {
      return pptGetGoldTrader().pipe(
        tap((gold) => {
          event.sender.send(GET_GOLD_EVENT, gold);
        })
      );
    })
  )
  .subscribe();

const onAppReady = fromNodeEvent(app, "ready").pipe(share());
const onAppWindowAllClosed = fromNodeEvent(app, "window-all-closed").pipe(
  share()
);

const onAppActivate = onAppReady.pipe(
  switchMap(() => fromNodeEvent(app, "activate")),
  share()
);

const onAppActivateNoWindows = onAppActivate.pipe(
  filter(() => BrowserWindow.getAllWindows().length === 0),
  share()
);

const onWinLoad = merge(onAppActivateNoWindows, onAppReady).pipe(
  switchMap(async () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true,
      },
    });

    // console.log(win.webContents);
    // win.loadURL("https://github.com");
    await win.loadFile("index.html");
    return win;
  }),
  share()
);

const onWinMinimize = onWinLoad.pipe(
  switchMap((win) => {
    return fromNodeEvent(win, "minimize");
  }),
  share()
);

onWinMinimize.subscribe(() => {
  console.log("minimize");
});

// onAppReady
//   .pipe(switchMap(() => listenShortcutKey("CommandOrControl+X")))
//   .subscribe(() => {
//     console.log("shortcut key press!");
//   });

onAppWindowAllClosed.subscribe(() => {
  console.log("close!");
  if (process.platform !== "darwin") app.quit();
});
