// See the Electron documentation for details on how to use preload scripts:

import { contextBridge, ipcRenderer } from "electron";
import { Observable, fromEvent, shareReplay } from "rxjs";
import { listenIPCMain } from "./ipc-renderer/listen-ipc-main";

// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
contextBridge.exposeInMainWorld("electronAPI", {
  sendToIPCMain: (eventName: string, arg: any): Promise<any> => {
    return new Promise((resolve) => {
      ipcRenderer.once(eventName, (event: Electron.IpcRendererEvent, arg) => {
        resolve(arg);
      });
      ipcRenderer.send(eventName, arg);
    });
  },

  sendSyncToIPCMain: (eventName: string, arg: any): any => {
    return ipcRenderer.sendSync(eventName, arg);
  },
});
