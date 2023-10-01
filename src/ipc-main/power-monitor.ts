import { powerMonitor } from "electron";
import { fromEventPattern } from "rxjs";

export const onPlugAC = fromEventPattern<void>(
  (handler) => {
    powerMonitor.on("on-ac", handler);
  },
  (handler) => {
    powerMonitor.off("on-ac", handler);
  }
);

export const onBattery = fromEventPattern<void>(
  (handler) => {
    powerMonitor.on("on-battery", handler);
  },
  (handler) => {
    powerMonitor.off("on-battery", handler);
  }
);
