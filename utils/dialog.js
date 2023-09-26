const { from } = require("rxjs");
const { dialog } = require("electron");
const fs = require("node:fs/promises");

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog();
  if (!canceled) {
    return filePaths[0];
  }
  return "";
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

module.exports = {
  dialogOpenFile: () => from(handleFileOpen()),
  dialogOpenImage: () => from(handleImageOpen()),
};
