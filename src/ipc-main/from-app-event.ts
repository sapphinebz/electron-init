import { Observable } from "rxjs";

interface AppEvent {
  preventDefault: () => void;
  readonly defaultPrevented: boolean;
}
/**
 *
 * @param {NodeStyleEventEmitter} app
 * @param {string} eventName
 * @returns Observable
 */
export function fromAppEvent(app: Electron.App, eventName: string) {
  return new Observable<AppEvent>((subscriber) => {
    const handler = (event: AppEvent) => subscriber.next(event);
    app.on(eventName as any, handler);
    return () => app.off(eventName, handler);
  });
}
