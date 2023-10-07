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
    const handler = subscriber.next.bind(subscriber);
    app.on(eventName as any, handler);
    subscriber.add(app.off.bind(app, eventName, handler));
  });
}
