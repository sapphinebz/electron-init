const { fromEvent, EMPTY, Observable } = require("rxjs");
const { share, switchMap } = require("rxjs/operators");
const {
  sendSyncMessage,
  fromAsyncReply,
  sendAsyncMessage,
} = require("./utils/ipc-renderer");
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
  sendAsyncMessage("gold", "get-gold");
});
fromAsyncReply("res-gold").subscribe(([event, arg]) => {
  const container = document.querySelector("#gold-price-container");
  container.innerText = JSON.stringify(arg);
});

fromElementEvent("#button", "click").subscribe(() => {
  console.log(sendSyncMessage("test-sync", "sync ping"));
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
