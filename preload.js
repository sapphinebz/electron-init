const { fromEvent, EMPTY, Observable } = require("rxjs");
const { share, switchMap } = require("rxjs/operators");
const ipcRenderer = require("./utils/ipc-renderer");
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  setTitle: (title) => {},
});

const onDOMContentLoaded = fromEvent(window, "DOMContentLoaded").pipe(share());

onDOMContentLoaded.subscribe(() => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});

fromElementEvent("#fetch-gold-btn", "click").subscribe(() => {
  ipcRenderer.sendToIPCMain("onGetGold");
});
ipcRenderer.listenIPCMain("onResultGold").subscribe(([event, arg]) => {
  const container = document.querySelector("#gold-price-container");
  container.innerText = JSON.stringify(arg);
});

fromElementEvent("#fetch-air-quality-btn", "click").subscribe(() => {
  ipcRenderer.sendToIPCMain("onGetAirQuality");
});
ipcRenderer.listenIPCMain("onResultAirQuality").subscribe(([event, arg]) => {
  const container = document.querySelector("[data-air-quality-container]");
  container.innerHTML = "";
  const template = document.querySelector("#air-quality-template");
  const fragment = template.content.cloneNode(true);
  const image = document.createElement("img");
  image.src = arg.imageSrc;
  image.alt = "image status";
  fragment.querySelector("[data-image]").appendChild(image);
  fragment.querySelector("[data-content]").innerText = arg.value.join(":");
  container.appendChild(fragment);
});

fromElementEvent("#button", "click").subscribe(() => {
  console.log(ipcRenderer.sendSyncToIPCMain("test-sync", "sync ping"));
});

function fromElementEvent(selector, eventName) {
  return onDOMContentLoaded.pipe(
    switchMap(() => {
      const element = document.querySelector(selector);
      if (element) {
        return fromEvent(element, eventName);
      }
      return EMPTY;
    })
  );
}
