// const { fromEvent, EMPTY, Observable } = require("rxjs");
// const { share, switchMap } = require("rxjs/operators");
// const ipcRenderer = require("./utils/ipc-renderer");
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openDialog: (title) => {},
  callRobot: () => {
    console.log("renderer callRobot");
    ipcRenderer.send("robot");
  },
  mockInterval: (callback) => {
    setInterval(() => {
      callback();
    }, 1000);
  },
});

// const onDOMContentLoaded = fromEvent(window, "DOMContentLoaded").pipe(share());

// onDOMContentLoaded.subscribe(() => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector);
//     if (element) element.innerText = text;
//   };

//   for (const dependency of ["chrome", "node", "electron"]) {
//     replaceText(`${dependency}-version`, process.versions[dependency]);
//   }
// });

// fromElementEvent("#open-file-btn", "click").subscribe(() => {
//   ipcRenderer.sendToIPCMain("onOpenFile");
// });

// fromElementEvent("#fetch-gold-btn", "click").subscribe(() => {
//   ipcRenderer.sendToIPCMain("onGetGold");
// });
// ipcRenderer.listenIPCMain("onResultGold").subscribe(([event, arg]) => {
//   const container = document.querySelector("#gold-price-container");
//   container.innerText = JSON.stringify(arg);
// });

// // ipcRenderer.sendToIPCMain("onGetAirQuality");
// ipcRenderer.listenIPCMain("onResultAirQuality").subscribe(([event, arg]) => {
//   // console.log(arg);
//   const viewEl = document.querySelector("[data-air-quality-view]");
//   // viewEl.innerHTML = "";
//   const template = document.querySelector("#air-quality-template");
//   const fragment = template.content.cloneNode(true);
//   const container = fragment.querySelector("[data-air-quality-container]");
//   const stationEl = fragment.querySelector("[data-station-name]");
//   container.style.backgroundColor = arg.bgColor;
//   container.style.color = "#fff";
//   stationEl.innerText = arg.stationName;

//   fragment.querySelector("[data-image]").innerHTML = arg.imageSVG;
//   fragment.querySelector("[data-content]").innerText = arg.value.join(" ");
//   viewEl.appendChild(fragment);
// });

// fromElementEvent("#button", "click").subscribe(() => {
//   console.log(ipcRenderer.sendSyncToIPCMain("test-sync", "sync ping"));
// });

// function fromElementEvent(selector, eventName) {
//   return onDOMContentLoaded.pipe(
//     switchMap(() => {
//       const element = document.querySelector(selector);
//       if (element) {
//         return fromEvent(element, eventName);
//       }
//       return EMPTY;
//     })
//   );
// }
