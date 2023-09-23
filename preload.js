const { fromEvent, EMPTY } = require("rxjs");
const { share, switchMap } = require("rxjs/operators");

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
