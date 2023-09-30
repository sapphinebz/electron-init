const { Observable } = require("rxjs");
const { globalShortcut } = require("electron");

function listenShortcutKey(shortcutKey) {
  return new Observable((subscriber) => {
    // ลงทะเบียน globalShortcut
    const ret = globalShortcut.register(shortcutKey, () => {
      subscriber.next(shortcutKey);
    });

    if (!ret) {
      const error = "ลงทะเบียน global shortcut ล้มเหลว";
      console.log(error);
      subscriber.error(error);
    }

    return () => {
      if (globalShortcut.isRegistered(shortcutKey)) {
        globalShortcut.unregister(shortcutKey);
      }
    };
  });
}

module.exports = { listenShortcutKey };
