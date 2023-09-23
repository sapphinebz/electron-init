// const { fromEvent } = require("rxjs");
// const { share } = require("rxjs/operators");

// const onDOMContentLoaded = fromEvent(window, "DOMContentLoaded").pipe(share());

// onDOMContentLoaded.subscribe(() => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector);
//     if (element) element.innerText = text;
//   };

//   console.log("DOMContentLoaded");

//   for (const dependency of ["chrome", "node", "electron"]) {
//     replaceText(`${dependency}-version`, process.versions[dependency]);
//   }
// });

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});
