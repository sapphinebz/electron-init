import { EMPTY, fromEvent, fromEventPattern } from "rxjs";
import { shareReplay, switchMap } from "rxjs/operators";

// require renderer.ts context
export const onDomInit = fromEvent(document, "DOMContentLoaded").pipe(
  shareReplay(1)
);

export function fromElementEvent(selector: string, eventName: string) {
  return onDomInit.pipe(
    switchMap(() => {
      const element = document.querySelector(selector);
      if (element) {
        return fromEvent(element, eventName);
      }
      return EMPTY;
    })
  );
}

export function fromInputElement(selector: string) {
  return onDomInit.pipe(
    switchMap(() => {
      const element = document.querySelector<HTMLInputElement>(selector);
      if (element) {
        return fromEventPattern<string>(
          (handler) => {
            element.addEventListener("input", handler);
          },
          (handler) => {
            element.removeEventListener("input", handler);
          },
          (e) => element.value
        );
      }
      return EMPTY;
    })
  );
}
