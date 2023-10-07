import { Menu, app } from "electron";
import { Observable, Subject } from "rxjs";
import { tap } from "rxjs/operators";

export const APPLICATION_NAME = "Boppin'n Code";

export const onMenu_ChooseDirectory = new Subject<void>();

export function createApplicationMenu(whenAppReady: Observable<any>) {
  return whenAppReady.pipe(
    tap(() => {
      const template: (
        | Electron.MenuItemConstructorOptions
        | Electron.MenuItem
      )[] = [
        {
          label: "File",
          submenu: [
            {
              label: "Choose Directory",
              accelerator: "CommandOrControl+o",
              click: (menuItem, browserWindow, event) => {
                onMenu_ChooseDirectory.next();
              },
            },
          ],
        },
      ];

      if (process.platform === "darwin") {
        template.unshift({
          label: APPLICATION_NAME,
          submenu: [
            {
              label: `About ${APPLICATION_NAME}`,
              role: "about",
            },
            {
              label: `Quit ${APPLICATION_NAME}`,
              role: "quit",
            },
          ],
        });
      }

      const applicationMenu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(applicationMenu);
    })
  );
}
