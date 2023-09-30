const { app, BrowserWindow } = require("electron");
const {
  merge,
  from,
  Observable,
  timer,
  fromEventPattern,
  connectable,
} = require("rxjs");
const path = require("node:path");
const {
  share,
  switchMap,
  tap,
  filter,
  exhaustMap,
  map,
  takeUntil,
} = require("rxjs/operators");
const {
  fromNodeEvent,
  fromNodeEventPromise,
} = require("./utils/from-node-event");
const shortcutKey = require("./utils/shortcut-key");
const ipcMain = require("./utils/ipc-main");
const ppt = require("./utils/puppeteer");
const net = require("./utils/net");
const dialog = require("./utils/dialog");
const childProcess = require("./utils/child-process");
// const powerMonitor = require("./utils/power-monitor");
// const { dialogOpenFile } = require("./utils/dialog");

// main process กับ renderer process

// ipcMain.listenIPCRenderer("test-sync").subscribe(([event, arg]) => {
//   event.returnValue = "sync pong";
// });

// ipcMain
//   .listenIPCRenderer("onGetGold")
//   .pipe(
//     switchMap(([event, arg]) => {
//       return ppt.getGoldTrader().pipe(
//         tap((value) => {
//           event.sender.send("onResultGold", value);
//         })
//       );
//     })
//   )
//   .subscribe();

// ipcMain
//   .listenIPCRenderer("onOpenFile")
//   .pipe(
//     switchMap(([event, arg]) => {
//       return dialog.dialogReadFile().pipe(tap((value) => console.log(value)));
//     })
//   )
//   .subscribe();

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

const onWinReady = merge(onAppActivateNoWindows, onAppReady).pipe(
  switchMap(async () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // console.log(win.webContents);
    // win.loadURL("https://github.com");
    await win.loadFile("index.html");
    win.webContents.openDevTools();
    win.setTitle("Boppin'n Code");

    // await fromNodeEventPromise(win, "ready-to-show");
    // console.log("ready-to-show");
    return win;
  }),
  share()
);

onWinReady
  .pipe(
    switchMap(() =>
      ipcMain.listenIPCRenderer("robot").pipe(
        switchMap(() => {
          const workerPath = path.join(__dirname, "child-robot.js");
          const childRobot = childProcess.createFork(workerPath);
          return fromEventPattern(
            () => {
              childRobot.send("Hello from port1");
            },
            () => {
              childRobot.kill();
            }
          ).pipe(
            takeUntil(shortcutKey.listenShortcutKey("CommandOrControl+X"))
          );
        })
      )
    )
  )
  .subscribe();

// const sendResultAirQuality = (win) =>
//   switchMap((arg) => {
//     return net.nodeHttps(arg.imageSrc).pipe(
//       tap((chunks) => {
//         win.webContents.send("onResultAirQuality", {
//           ...arg,
//           imageSVG: chunks.toString(),
//         });
//       })
//     );
//   });

// onWinReady
//   .pipe(
//     exhaustMap((win) => {
//       const station1 = ppt
//         .pptGetThonBuri_RojjirapaKindergarten()
//         .pipe(sendResultAirQuality(win));

//       const station2 = ppt
//         .pptGetSomdulAgroforestryHomeAirQuality()
//         .pipe(sendResultAirQuality(win));

//       return merge(station1, station2);
//     })
//   )
//   .subscribe();

const onWinMinimize = onWinReady.pipe(
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
