import fs from "node:fs/promises";
import { dialog } from "electron";
import { from } from "rxjs";

async function handleFileOpen(options: Electron.OpenDialogOptions) {
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

async function handleSave(options: Electron.SaveDialogOptions) {
  const { filePath, canceled, bookmark } = await dialog.showSaveDialog(options);
  if (!canceled) {
    return { filePath, bookmark };
  }
  return null;
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

export const dialogOpenImage = () => from(handleImageOpen());
export const dialogOpenFile = (options: Electron.OpenDialogOptions = {}) =>
  from(handleFileOpen(options));
export const dialogReadFile = () => from(handleReadFile());
export const dialogOpenSaveFile = () =>
  from(
    handleSave({
      title: "Save File",
      defaultPath: "/Users/thanaditbuthong/Desktop",
    })
  );
