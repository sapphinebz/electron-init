import { app, BrowserWindow } from "electron";
import { fromAppEvent } from "./ipc-main/from-app-event";
import { fromBrowserEvent } from "./ipc-main/from-browser-event";
import { filter, share, switchMap, takeUntil, tap } from "rxjs/operators";
import path from "node:path";

import { fromEventPattern, merge } from "rxjs";
import { createFork } from "./ipc-main/child-process";
import { listenShortcutKey } from "./ipc-main/listen-shortcut-key";
import { pptGetThonBuri_RojjirapaKindergarten } from "./ipc-main/puppeteer";
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const UTILITY_PROCESS_MODULE_PATH: string;
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

const onAppReady = fromAppEvent(app, "ready").pipe(share());
const onAppWindowAllClosed = fromAppEvent(app, "window-all-closed").pipe(
  share()
);
const onAppActivate = onAppReady.pipe(
  switchMap(() => fromAppEvent(app, "activate")),
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
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // win.loadURL("https://github.com");
    await win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    win.webContents.openDevTools();
    win.setTitle("Boppin'n Code");

    // await fromNodeEventPromise(win, "ready-to-show");
    // console.log("ready-to-show");

    return win;
  }),
  share()
);

const onWinMinimize = onWinReady.pipe(
  switchMap((win) => {
    return fromBrowserEvent(win, "minimize");
  }),
  share()
);

onWinMinimize.subscribe(() => {
  console.log("minimize");
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.

onAppWindowAllClosed.subscribe(() => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

const keyCommandX = listenShortcutKey("CommandOrControl+X");
const keyStartRobot = listenShortcutKey("]");

onAppReady
  .pipe(switchMap(() => keyStartRobot.pipe(runRobotChildProcess())))
  .subscribe();
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

function runRobotChildProcess() {
  return switchMap<any, any>(() => {
    // const workerPath = path.join(__dirname, "child-robot.js");
    // const childRobot = createFork(workerPath);
    const childRobot = createFork(UTILITY_PROCESS_MODULE_PATH);
    return fromEventPattern<void>(
      () => {
        childRobot.send("Hello from port1");
      },
      () => {
        childRobot.kill();
      }
    ).pipe(takeUntil(keyCommandX));
  });
}

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
