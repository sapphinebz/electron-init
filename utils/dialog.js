const { from } = require("rxjs");
const { dialog } = require("electron");
const fs = require("node:fs/promises");

async function handleFileOpen(options) {
  const { canceled, filePaths } = await dialog.showOpenDialog(options);
  if (!canceled) {
    return filePaths;
  }
  return [];
}

async function handleImageOpen() {
  const { canceled, filePaths, bookmarks } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg"] }],
  });
  if (!canceled) {
    return null;
  }

  const file = await fs.readFile(filePaths[0]);
  return file.toString("base64");
}

async function handleReadFile() {
  const paths = await handleFileOpen({
    properties: ["openFile"],
    buttonLabel: "Unveil",
    title: "Open Document",
    filters: [
      // {
      //   name: "Markdown Files",
      //   extensions: ["md", "mdown", "markdown", "marcdown"],
      // },
      // {
      //   name: "Text Files",
      //   extensions: ["txt", "text"],
      // },
      {
        name: "Javascript Files",
        extensions: ["js", "script"],
      },
    ],
  });

  if (paths.length > 0) {
    const path = paths[0];
    const content = await fs.readFile(path);
    return {
      path,
      content: content.toString(),
    };
  }
  return null;
}

module.exports = {
  dialogOpenFile: (options = {}) => from(handleFileOpen(options)),
  dialogOpenImage: () => from(handleImageOpen()),
  dialogReadFile: () => from(handleReadFile()),
};
