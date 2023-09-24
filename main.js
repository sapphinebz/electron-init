const { app, BrowserWindow } = require("electron");
const { merge } = require("rxjs");
const path = require("node:path");
const { share, switchMap, tap, filter } = require("rxjs/operators");
const { fromNodeEvent } = require("./utils/from-node-event");
// const { listenShortcutKey } = require("./utils/shortcut-key");
const { listenIPCRenderer } = require("./utils/ipc-main");
const { pptGetGoldTrader } = require("./utils/puppeteer");
const { dialogOpenFile } = require("./utils/dialog");

// main process กับ renderer process

listenIPCRenderer("test-sync").subscribe(([event, arg]) => {
  event.returnValue = "sync pong";
});

listenIPCRenderer("gold")
  .pipe(
    filter(([event, arg]) => arg === "get-gold"),
    switchMap(([event, arg]) => {
      return pptGetGoldTrader().pipe(
        tap((gold) => {
          event.sender.send("res-gold", gold);
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

// onAppReady.subscribe(() => {
//   setTimeout(() => {
//     dialogOpenFile().subscribe((value) => {
//       console.log("dialog", value);
//     });
//   }, 1000);
// });

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
    win.webContents.openDevTools();
    win.setTitle("Boppin'n Code");
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
