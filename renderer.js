const { fromEvent, EMPTY, from } = rxjs;
const { share, switchMap, exhaustMap } = rxjs.operators;
const { mockInterval, callRobot } = window.electronAPI;

const onDOMContentLoaded = fromEvent(window, "DOMContentLoaded").pipe(share());

fromElementEvent("#robotBtn", "click").subscribe((event) => {
  callRobot();
});

fromElementEvent("#requestDeviceBtn", "click")
  .pipe(
    exhaustMap(() => {
      return requestDevices([
        {
          usagePage: 0xff60,
          usage: 0x61,
        },
      ]);
    })
  )
  .subscribe((event) => {
    console.log(event);
  });

function fromElementEvent(selector, eventName) {
  return onDOMContentLoaded.pipe(
    switchMap(() => {
      const el = document.querySelector(selector);
      if (el) {
        return fromEvent(el, eventName);
      }
      return EMPTY;
    })
  );
}

function requestDevices(filters) {
  return from(
    navigator.hid.requestDevice({
      filters,
    })
  );
}
