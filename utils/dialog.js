const { from } = require("rxjs");
const { dialog } = require("electron");

async function handleFileOpen(options) {
  const { canceled, filePaths } = await dialog.showOpenDialog(options);
  if (!canceled) {
    return filePaths;
  }
  return [];
}

function dialogOpenFile(options) {
  return from(handleFileOpen(options));
}

module.exports = {
  dialogOpenFile,
};
