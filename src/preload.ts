// See the Electron documentation for details on how to use preload scripts:

import { contextBridge, ipcRenderer } from "electron";

// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
contextBridge.exposeInMainWorld("electronAPI", {
  sendAsyncToIPCMain: (eventName: string, arg: any): Promise<any> => {
    return new Promise((resolve) => {
      ipcRenderer.once(eventName, (event: Electron.IpcRendererEvent, arg) => {
        resolve(arg);
      });
      ipcRenderer.send(eventName, arg);
    });
  },

  sendToIPCMain: (eventName: string, ...args: any[]): void => {
    ipcRenderer.send.call(ipcRenderer, eventName, ...args);
  },

  listenIPCMain: (eventName: string, handler: (...args: any[]) => void) => {
    const proxyHandler = (event: Electron.IpcRendererEvent, ...args: any[]) => {
      handler(args);
    };
    ipcRenderer.addListener(eventName, proxyHandler);
    return ipcRenderer.removeListener.bind(
      ipcRenderer,
      eventName,
      proxyHandler
    );
  },

  sendSyncToIPCMain: (eventName: string, arg: any): any => {
    return ipcRenderer.sendSync(eventName, arg);
  },
});
