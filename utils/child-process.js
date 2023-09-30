const { utilityProcess, MessageChannelMain } = require("electron");
const { fromEventPattern, bindCallback, Observable } = require("rxjs");
const { switchMap } = require("rxjs/operators");
/**
 *
 * @param {string} filePath
 */
function createFork(filePath) {
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
    send: (msg) => {
      port1.postMessage(msg);
    },
    messagePort,
  };
}

const fromParentPort = bindCallback((cb) => {
  process.parentPort.once("message", (e) => {
    const [port] = e.ports;
    cb(port);
  });
});

function fromPortMessage() {
  return fromParentPort().pipe(
    switchMap((port) => {
      return fromEventPattern(
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

function onProcessExit() {
  return new Observable((subscriber) => {
    process.on("exit", () => {
      subscriber.next();
      subscriber.complete();
    });
  });
}

module.exports = { createFork, fromParentPort, fromPortMessage, onProcessExit };
