import { app, BrowserView, BrowserWindow, Notification } from "electron";

import {
  filter,
  map,
  share,
  shareReplay,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { fromAppEvent } from "./ipc-main/from-app-event";
import { fromBrowserEvent } from "./ipc-main/from-browser-event";

import { dialogOpenFile } from "./ipc-main/dialog";
import { listenIPCRenderer } from "./ipc-main/listen-ipc-renderer";
import {
  createApplicationMenu,
  onMenu_ChooseDirectory,
} from "./ipc-main/menu/create-application.menu";
import { merge, Observable, OperatorFunction } from "rxjs";
import { readAssetFile } from "./ipc-main/file-system/read-asset-file";

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

readAssetFile("config.json").subscribe((text) => {
  const json = JSON.parse(text);
  console.log(`applicationName:${json.applicationName}`);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

const whenAppReady = fromAppEvent(app, "ready").pipe(shareReplay(1));

const onAppWindowAllClosed = fromAppEvent(app, "window-all-closed").pipe(
  share()
);
const onAppActivate = whenAppReady.pipe(
  switchMap(() => fromAppEvent(app, "activate")),
  share()
);
const onAppActivateNoWindows = onAppActivate.pipe(
  filter(() => BrowserWindow.getAllWindows().length === 0),
  share()
);

const successNotification = whenAppReady.pipe(
  map(
    () =>
      new Notification({
        title: "Process Complete!",
        body: "xxxxx",
      })
  ),
  shareReplay(1)
);
successNotification.subscribe();

whenAppReady.pipe(createApplicationMenu()).subscribe();

const onWinReady = merge(onAppActivateNoWindows, whenAppReady).pipe(
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

    return win;
  }),
  shareReplay(1)
);

const onWinFocus = onWinReady.pipe(listenBrowser("focus"));
const onWinBlur = onWinReady.pipe(listenBrowser("blur"));
const onWinMinimize = onWinReady.pipe(listenBrowser("minimize"));
const onWebDevToolsOpened = onWinReady.pipe(
  listenWebContents("devtools-opened")
);
const onWebDevToolOpen = onWinReady.pipe(listenWebContents("devtools-closed"));
const onWebDevToolFocused = onWinReady.pipe(
  listenWebContents("devtools-focused")
);

// onWinReady.subscribe(async (win) => {
//   const view = new BrowserView();
//   win.setBrowserView(view);
//   view.setBounds({ x: 500, y: 0, width: 300, height: 600 });
//   await view.webContents.loadURL("https://chat.openai.com");
//   view.webContents.openDevTools();
//   view.webContents.executeJavaScript("console.log('Hello View')");
//   console.log("open success");
//   // view.webContents.devToolsWebContents.sendInputEvent;
// });

// win.webContents.executeJavaScript('fetch("https://jsonplaceholder.typicode.com/users/1").then(resp => resp.json())', true)
//   .then((result) => {
//     console.log(result) // Will be the JSON object from the fetch call
//   })

// const pairingBlueTooth = onWinReady.pipe(
//   switchMap((win) => {
//     return new Observable((subscriber) => {
//       win.webContents.session.setBluetoothPairingHandler(
//         (details, callback) => {
//           // bluetoothPinCallback = callback
//           console.log("details", details);
//           // Send a message to the renderer to prompt the user to confirm the pairing.
//           win.webContents.send("bluetooth-pairing-request", details);
//         }
//       );

//       subscriber.add(() => {
//         win.webContents.session.setBluetoothPairingHandler(null);
//       });
//     });
//   })
// );

// pairingBlueTooth.subscribe();

onWinReady
  .pipe(
    switchMap((win) =>
      merge(
        onMenu_ChooseDirectory,
        listenIPCRenderer("onChooseDirectory")
      ).pipe(
        switchMap(() => {
          return dialogOpenFile({
            title: "target directory",
            buttonLabel: "confirm",
            properties: ["openDirectory", "multiSelections"],
          }).pipe(
            tap((directories) => {
              win.webContents.send("onChoosenDirectory", directories);
            })
          );
        })
      )
    )
  )
  .subscribe();

// async send is the better way than sync
// onWinReady
//   .pipe(
//     switchMap(() =>
//       listenIPCRenderer("onChooseDirectory").pipe(
//         switchMap(([event, arg]) => {
//           return dialogOpenFile({
//             title: "select the directory",
//             buttonLabel: "choose",
//             properties: ["openDirectory", "multiSelections"],
//           }).pipe(
//             tap((directories) => {
//               event.returnValue = directories;
//             })
//           );
//         })
//       )
//     )
//   )
//   .subscribe();

onWinReady
  .pipe(
    switchMap(() =>
      listenIPCRenderer("onSubmitDirectory").pipe(
        withLatestFrom(successNotification),
        tap(([[event, formValue], notification]) => {
          console.log(formValue);
          setTimeout(() => {
            if (Notification.isSupported()) {
              notification.show();
            }
            event.sender.send("onSubmitDirectory", "success!");
          }, 2000);
        })
      )
    )
  )
  .subscribe();

onWinMinimize.subscribe(() => {
  console.log("browserWindow minimize");
});

onWinFocus.subscribe(() => {
  console.log("browserWindow focus");
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.

onAppWindowAllClosed.subscribe(() => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// const keyCommandX = listenShortcutKey("CommandOrControl+X");
// const keyStartRobot = listenShortcutKey("]");

// onAppReady
//   .pipe(switchMap(() => keyStartRobot.pipe(runRobotChildProcess())))
//   .subscribe();
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// function runRobotChildProcess() {
//   return switchMap<any, any>(() => {
//     // const workerPath = path.join(__dirname, "child-robot.js");
//     // const childRobot = createFork(workerPath);
//     const childRobot = createFork(UTILITY_PROCESS_MODULE_PATH);
//     return fromEventPattern<void>(
//       () => {
//         childRobot.send("Hello from port1");
//       },
//       () => {
//         childRobot.kill();
//       }
//     ).pipe(takeUntil(keyCommandX));
//   });
// }

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

function listenBrowser(
  eventName: string
): OperatorFunction<BrowserWindow, any> {
  return (browserWinReady: Observable<BrowserWindow>) =>
    browserWinReady.pipe(
      switchMap((win) => fromBrowserEvent(win, eventName)),
      share()
    );
}

function listenWebContents<T = any>(eventName: string) {
  return (browserWinReady: Observable<BrowserWindow>) =>
    browserWinReady.pipe(
      switchMap(
        (win) =>
          new Observable<T>((subscriber) => {
            const handler = subscriber.next.bind(subscriber);
            win.webContents.on(eventName as any, handler);
            console.log(eventName);
            subscriber.add(win.webContents.off.bind(eventName as any, handler));
          })
      ),
      share()
    );
}
