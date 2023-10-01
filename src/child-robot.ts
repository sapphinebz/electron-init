import { Observable, from } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";
import { fromPortMessage, onProcessExit } from "./ipc-main/child-process";

import * as robot from "robotjs";

fromPortMessage()
  .pipe(
    switchMap(() => {
      return from(runRobot()).pipe(takeUntil(onProcessExit()));
    })
  )
  .subscribe();

function delay(period: number) {
  return new Promise<void>((resolve) => setTimeout(resolve.bind(this), period));
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
