const { powerMonitor } = require("electron");
const { fromEventPattern } = require("rxjs");

module.exports = {
  onPlugAC: fromEventPattern(
    (handler) => {
      powerMonitor.on("on-ac", handler);
    },
    (handler) => {
      powerMonitor.off("on-ac", handler);
    }
  ),
  onBattery: fromEventPattern(
    (handler) => {
      powerMonitor.on("on-battery", handler);
    },
    (handler) => {
      powerMonitor.off("on-battery", handler);
    }
  ),
};
