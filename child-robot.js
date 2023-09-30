const { Observable } = require("rxjs");
const { switchMap, takeUntil } = require("rxjs/operators");
const robot = require("robotjs");
const { fromPortMessage, onProcessExit } = require("./utils/child-process");

const testRobot = () =>
  new Observable((subscriber) => {
    // Speed up the mouse.
    robot.setMouseDelay(2);

    const twoPI = Math.PI * 2.0;
    const screenSize = robot.getScreenSize();
    const height = screenSize.height / 2 - 10;
    const width = screenSize.width;
    let progress = true;

    for (var x = 0; x < width && progress; x++) {
      y = height * Math.sin((twoPI * x) / width) + height;
      robot.moveMouse(x, y);
      subscriber.next({ x, y });
    }
    if (!subscriber.closed) {
      subscriber.complete();
    }

    return {
      unsubscribe: () => {
        progress = false;
      },
    };
  });

fromPortMessage()
  .pipe(
    switchMap(() => {
      return testRobot().pipe(takeUntil(onProcessExit()));
    })
  )
  .subscribe();
