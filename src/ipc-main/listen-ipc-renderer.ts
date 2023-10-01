import { ipcMain } from "electron";
import { fromEventPattern } from "rxjs";

export function listenIPCRenderer<T = any>(channel: string) {
  return fromEventPattern<T>(
    (handler) => {
      ipcMain.on(channel, handler);
    },
    (handler) => ipcMain.off(channel, handler)
  );
}
