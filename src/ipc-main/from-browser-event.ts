import { BrowserWindow } from "electron";
import { fromEventPattern } from "rxjs";

export function fromBrowserEvent(win: BrowserWindow, eventName: string) {
  return fromEventPattern<void>(
    (handler) => {
      win.on(eventName as any, handler);
    },
    (handler) => {
      win.off(eventName as any, handler);
    }
  );
}
