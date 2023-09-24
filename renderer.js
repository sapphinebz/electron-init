// const { ipcRenderer } = require("electron");
// // console.log("renderer", ipcRenderer);

// window.electronAPI.setTitle(title);
console.log("renderer", window.electronAPI);

// loadScript("https://unpkg.com/rxjs@^7/dist/bundles/rxjs.umd.min.js", () => {
//   // const { fromEvent } = rxjs;
//   // fromEvent()
//   console.log("loaded script");
// });

// /**
//  *
//  * @param {string} url
//  * @param {()=>void} callback
//  */
// function loadScript(src, callback) {
//   const scriptEl = document.createElement("script");
//   scriptEl.async = true;
//   scriptEl.src = src;
//   const controller = new AbortController();
//   scriptEl.addEventListener(
//     "load",
//     () => {
//       callback();
//       controller.abort();
//     },
//     { signal: controller.signal }
//   );

//   scriptEl.addEventListener(
//     "error",
//     () => {
//       controller.abort();
//     },
//     { signal: controller.signal }
//   );
// }
