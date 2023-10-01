import { utilityProcess, MessageChannelMain, MessageEvent } from "electron";
import { fromEventPattern, bindCallback, Observable } from "rxjs";
import { switchMap } from "rxjs/operators";
/**
 *
 * @param {string} filePath
 */
export function createFork(filePath: string) {
  const { port1, port2 } = new MessageChannelMain();
  const child = utilityProcess.fork(filePath);
  child.postMessage("Hi there!", [port2]);

  const messagePort = fromEventPattern(
    (handler) => {
      port1.on("message", handler);
      port1.start();
    },
    (handler) => {
      port1.off("message", handler);
      port1.close();
    }
  );

  return {
    kill: () => {
      child.kill();
    },
    send: (msg: string) => {
      port1.postMessage(msg);
    },
    messagePort,
  };
}

export function fromParentPort() {
  return new Observable<Electron.MessagePortMain>((subscriber) => {
    process.parentPort.once("message", (messageEvent) => {
      const [port] = messageEvent.ports;
      subscriber.next(port);
      subscriber.complete();
    });
  });
}

export function fromPortMessage<T = any>() {
  return fromParentPort().pipe(
    switchMap((port) => {
      return fromEventPattern<T>(
        (handler) => {
          port.on("message", handler);
          port.start();
        },
        (handler) => {
          port.off("message", handler);
          port.close();
        }
      );
    })
  );
}

export function onProcessExit() {
  return new Observable<void>((subscriber) => {
    process.on("exit", () => {
      subscriber.next();
      subscriber.complete();
    });
  });
}
