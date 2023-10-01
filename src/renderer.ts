/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import { EMPTY, combineLatest, fromEvent } from "rxjs";
import {
  distinctUntilChanged,
  exhaustMap,
  map,
  share,
  shareReplay,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import "./index.css";
import {
  fromElementEvent,
  fromInputElement,
} from "./ipc-renderer/renderer-utils";
import { cloneTemplate } from "./ipc-renderer/clone-template";
import "./webcomponents/ids-ring-spinner";
import {
  IdsRingSpinner,
  manageSpinner,
} from "./webcomponents/ids-ring-spinner";

const electronAPI = (window as any)["electronAPI"];
const sendSyncToIPCMain: (eventName: string, arg: any) => any =
  electronAPI.sendSyncToIPCMain;
const sendToIPCMain: (eventName: string, arg: any) => Promise<any> =
  electronAPI.sendToIPCMain;

const spinnerEl = document.querySelector<IdsRingSpinner>("ids-ring-spinner");
const { addTask, doneTask } = manageSpinner(spinnerEl);

const onClickChooseDirectory = fromElementEvent(
  "#chooseDirectoryBtn",
  "click"
).pipe(share());

const onChangeSourceInput = fromInputElement("#source-inpt").pipe(share());

const onChangeReplaceInput = fromInputElement("#replace-inpt").pipe(share());

const directoriesChange = onClickChooseDirectory.pipe(
  map((event) => {
    const directories: string[] = sendSyncToIPCMain(
      "onChooseDirectory",
      "Hello"
    );
    const container = document.querySelector("[data-directory-choosen]");
    container.innerHTML = "";
    for (const directory of directories) {
      const fragment = cloneTemplate("#directory-choosen-template");
      const nameEl = fragment.querySelector<HTMLDivElement>("[data-name]");
      nameEl.innerText = directory;
      container.append(fragment);
    }
    return directories;
  }),
  shareReplay(1)
);

const onFormChange = combineLatest({
  source: onChangeSourceInput,
  replace: onChangeReplaceInput,
  directories: directoriesChange,
}).pipe(shareReplay(1));

const validation = onFormChange.pipe(
  map(({ source, replace, directories }) => {
    return Boolean(source) && Boolean(replace) && directories.length > 0;
  }),
  distinctUntilChanged(),
  shareReplay(1)
);

const submitEl = document.querySelector<HTMLButtonElement>("#submitBtn");
validation.subscribe((valid) => {
  if (valid) {
    submitEl.removeAttribute("disabled");
  } else {
    submitEl.setAttribute("disabled", "");
  }
});

const onClickSubmitForm = fromElementEvent("#submitBtn", "click").pipe(share());

const onSubmitForm = onClickSubmitForm.pipe(
  withLatestFrom(onFormChange, (_, formValue) => formValue),
  exhaustMap((formValue) => {
    addTask();
    return sendToIPCMain("onSubmitDirectory", formValue);
  })
);

onSubmitForm.subscribe((response) => {
  doneTask();
  console.log(response);
});
