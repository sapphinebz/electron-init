const { fromEvent, EMPTY, Observable } = require("rxjs");
const { share, switchMap, tap } = require("rxjs/operators");
const ipcRenderer = require("./utils/ipc-renderer");
const { contextBridge } = require("electron");

// expose to window variable in renderer.js
// contextBridge.exposeInMainWorld("electronAPI", {
//   setTitle: (title) => {},
// });

const onDOMContentLoaded = fromEvent(window, "DOMContentLoaded").pipe(share());

fromElementEvent("#chooseDirectoryBtn", "click")
  .pipe(
    tap(() => {
      ipcRenderer.sendToIPCMain("onChooseDirectory", "dialog");
    })
  )
  .subscribe();

fromElementEvent("#submitBtn", "click")
  .pipe(
    tap(() => {
      const forms = document.querySelectorAll("[data-form-control]");
      const value = Array.from(forms).reduce(
        (value, form) => ({ ...value, [form.name]: form.value }),
        {}
      );
      ipcRenderer.sendToIPCMain("submitDirectory", value);
    })
  )
  .subscribe();

ipcRenderer.listenIPCMain("onDirectoryChoosen").subscribe(([event, arg]) => {
  const container = document.querySelector("[data-directory-choosen]");
  for (const directory of arg) {
    const div = document.createElement("div");
    div.innerText = directory;
    container.appendChild(div);
  }
});

// onDOMContentLoaded.subscribe(() => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector);
//     if (element) element.innerText = text;
//   };

//   for (const dependency of ["chrome", "node", "electron"]) {
//     replaceText(`${dependency}-version`, process.versions[dependency]);
//   }
// });

// fromElementEvent("#fetch-gold-btn", "click").subscribe(() => {
//   sendAsyncMessage("gold", "get");
// });
// fromAsyncReply("gold-get").subscribe(([event, arg]) => {
//   const container = document.querySelector("#gold-price-container");
//   container.innerText = JSON.stringify(arg);
// });

// fromElementEvent("#air-quality-btn", "click").subscribe(() => {
//   sendAsyncMessage("air-quality", "get");
// });

// fromAsyncReply("air-quality-get").subscribe(([event, arg]) => {
//   const container = document.querySelector("#air-quality-container");
//   container.innerText = arg.value.join(":");
// });

// fromElementEvent("#button", "click").subscribe(() => {
//   console.log(sendSyncMessage("test-sync", "sync ping"));
// });

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
