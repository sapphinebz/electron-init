import { ipcMain } from "electron";
import { fromEventPattern } from "rxjs";

export function listenIPCRenderer<T = any>(channel: string) {
  return fromEventPattern<[Electron.IpcMainEvent, T]>(
    (handler) => {
      ipcMain.on(channel, handler);
    },
    (handler) => ipcMain.off(channel, handler)
  );
}
