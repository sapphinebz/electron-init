const { app, BrowserWindow } = require("electron");
const { merge, concat, from, connectable, ReplaySubject } = require("rxjs");
const path = require("node:path");
const {
  share,
  switchMap,
  tap,
  filter,
  takeUntil,
  take,
  map,
  shareReplay,
  withLatestFrom,
} = require("rxjs/operators");
const dialog = require("./utils/dialog");
const { fromNodeEvent } = require("./utils/from-node-event");
const { listenShortcutKey } = require("./utils/shortcut-key");
const ipcMain = require("./utils/ipc-main");
const {
  pptGetGoldTrader,
  pptGetTerdThaiAirQuality,
} = require("./utils/puppeteer");

// main process กับ renderer process

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

const onWinLoaded = merge(onAppActivateNoWindows, onAppReady).pipe(
  switchMap(() => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true,
      },
    });

    // win.loadURL("https://github.com");
    return from(win.loadFile("index.html")).pipe(
      switchMap(() => {
        win.webContents.openDevTools();
        win.setTitle("Yo file replacer");
        return fromNodeEvent(win, "ready-to-show");
      }),
      map(() => win)
    );
  }),
  share()
);

const onWinMinimize = onWinLoaded.pipe(
  switchMap((win) => {
    return fromNodeEvent(win, "minimize");
  }),
  share()
);

const choosenDirectory$ = connectable(
  onWinLoaded.pipe(
    switchMap(() =>
      ipcMain.listenIPCRenderer("onChooseDirectory").pipe(
        switchMap(([event, arg]) => {
          return dialog
            .dialogOpenFile({
              title: "select the directory",
              buttonLabel: "choose",
              properties: ["openDirectory", "multiSelections"],
            })
            .pipe(
              tap((directories) => {
                event.sender.send("onDirectoryChoosen", directories);
              })
            );
        })
      )
    )
  ),
  {
    connector: () => new ReplaySubject(1),
    resetOnDisconnect: false,
  }
);
choosenDirectory$.connect();

onWinLoaded
  .pipe(
    switchMap(() =>
      ipcMain.listenIPCRenderer("submitDirectory").pipe(
        map(([event, arg]) => {
          return arg;
        }),
        withLatestFrom(choosenDirectory$),
        tap(([arg, directories]) => {
          console.log(arg, directories);
        })
      )
    )
  )
  .subscribe();

// onWinMinimize.subscribe(() => {
//   console.log("minimize");
// });

// onAppReady
//   .pipe(switchMap(() => listenShortcutKey("CommandOrControl+X")))
//   .subscribe(() => {
//     console.log("shortcut key press!");
//   });

onAppWindowAllClosed.subscribe(() => {
  console.log("close!");
  if (process.platform !== "darwin") app.quit();
});
