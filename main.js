const { app, BrowserWindow } = require("electron");
const { fromEvent, merge } = require("rxjs");
const path = require("node:path");

const { share, switchMap, tap, filter } = require("rxjs/operators");
const { fromNodeEvent } = require("./utils/from-node-event");
const { listenShortcutKey } = require("./utils/shortcut-key");

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

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");
};

merge(onAppActivateNoWindows, onAppReady)
  .pipe(
    tap(() => {
      createWindow();
    })
  )
  .subscribe();

onAppReady
  .pipe(switchMap(() => listenShortcutKey("CommandOrControl+X")))
  .subscribe(() => {
    console.log("shortcut key press!");
  });

onAppWindowAllClosed.subscribe(() => {
  console.log("close!");
  if (process.platform !== "darwin") app.quit();
});
