const { from } = require("rxjs");
const { dialog } = require("electron");

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog();
  if (!canceled) {
    return filePaths[0];
  }
  return "";
}

function dialogOpenFile() {
  return from(handleFileOpen());
}

module.exports = {
  dialogOpenFile,
};
