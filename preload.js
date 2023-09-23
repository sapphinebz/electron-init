const { fromEvent, EMPTY, Observable } = require("rxjs");
const { share, switchMap } = require("rxjs/operators");
const {
  sendSyncMessage,
  fromAsyncReply,
  sendAsyncMessage,
} = require("./utils/ipc-renderer");

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

const GET_GOLD_EVENT = "get-gold";
fromElementEvent("#fetch-gold-btn", "click").subscribe(() => {
  sendAsyncMessage(GET_GOLD_EVENT);
});
fromAsyncReply(GET_GOLD_EVENT).subscribe(([event, arg]) => {
  const container = document.querySelector("#gold-price-container");
  container.innerText = JSON.stringify(arg);
});

fromElementEvent("#button", "click").subscribe(() => {
  console.log("click");
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
