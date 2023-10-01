const { Observable, from } = require("rxjs");
const { switchMap, takeUntil } = require("rxjs/operators");
const robot = require("robotjs");
const { fromPortMessage, onProcessExit } = require("./utils/child-process");

fromPortMessage()
  .pipe(
    switchMap(() => {
      return from(runRobot()).pipe(takeUntil(onProcessExit()));
    })
  )
  .subscribe();

function delay(period) {
  return new Promise((resolve) => setTimeout(resolve.bind(this), period));
}

async function runRobot() {
  robot.moveMouse(115, 16);
  await delay(100);
  robot.mouseClick("left");
  await delay(100);
  robot.keyTap("down");
  await delay(100);
  robot.keyTap("enter");
  await delay(100);
  robot.typeString("console.log('Hello World');");
  await delay(10);
  robot.keyTap("enter");
  await delay(10);
  robot.typeString("console.log('Hello World');");
  await delay(10);
  robot.keyTap("enter");
  await delay(10);
  robot.typeString("console.log('Hello World');");
}
