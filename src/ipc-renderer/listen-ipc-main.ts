import { ipcRenderer } from "electron";
import { fromEventPattern } from "rxjs";

export function listenIPCMain(eventName: string) {
  return fromEventPattern<[Electron.IpcRendererEvent, ...any]>(
    (handler) => {
      ipcRenderer.on(eventName, handler);
    },
    (handler) => {
      ipcRenderer.off(eventName, handler);
    }
  );
}
