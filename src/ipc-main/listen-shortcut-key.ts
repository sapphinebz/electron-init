import { Observable } from "rxjs";
import { globalShortcut } from "electron";

export function listenShortcutKey(accelerator: string) {
  return new Observable<string>((subscriber) => {
    if (!globalShortcut.isRegistered(accelerator)) {
      // ลงทะเบียน globalShortcut
      const ret = globalShortcut.register(accelerator, () => {
        subscriber.next(accelerator);
      });

      if (!ret) {
        const error = "register global shortcut failed";
        console.log(error);
        subscriber.error(error);
      } else {
        subscriber.add(() => {
          if (globalShortcut.isRegistered(accelerator)) {
            globalShortcut.unregister(accelerator);
          }
        });
      }
    }
  });
}
