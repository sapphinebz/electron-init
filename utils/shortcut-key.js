const { Observable } = require("rxjs");
const { globalShortcut } = require("electron");

function listenShortcutKey(shortcutKey) {
  return new Observable((subscriber) => {
    // ลงทะเบียน globalShortcut
    const ret = globalShortcut.register(shortcutKey, () => {
      subscriber.next(shortcutKey);
    });

    if (!ret) {
      console.log("ลงทะเบียน global shortcut ล้มเหลว");
    }

    return () => {
      if (globalShortcut.isRegistered("CommandOrControl+X")) {
        globalShortcut.unregister(shortcutKey);
      }
    };
  });
}

module.exports = { listenShortcutKey };
