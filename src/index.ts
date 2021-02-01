import { app, BrowserWindow, dialog, ipcMain } from "electron";
import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";
import { PDFFile } from "./interfaces";
declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: true,
    },
    // icon: "./assets/icon.png",
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  if (process.env.NODE_ENV === "development") {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Merging the pdf files
const mergePDFs = async (pdfs: PDFFile[]): Promise<Uint8Array> => {
  const result = await PDFDocument.create();
  for (const pdf of pdfs) {
    const pdfBuffer = fs.readFileSync(pdf.path);
    const newPdf = await PDFDocument.load(pdfBuffer);
    let pageIndicesArray = [];
    if (pdf.pages === "all") {
      pageIndicesArray = newPdf.getPageIndices();
    } else {
      pageIndicesArray = parsePages(pdf.pages, newPdf.getPageCount());
    }
    const pagesArray = await result.copyPages(newPdf, pageIndicesArray);
    for (const page of pagesArray) {
      result.addPage(page);
    }
  }

  return result.save();
};

// Parsing a string to a numbers array e.g. 1,2,3,7-10 -> [1,2,3,7,8,9,10]
const parsePages = (pages: string, maxPages: number): number[] => {
  const indices: number[] = [];
  // Remove white spaces and letters and special characters except , and -
  pages = pages.replace(/[^0-9-,]/gi, "");
  const values = pages.split(",");
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value.indexOf("-") === -1) {
      const convertValue = parseInt(value);
      if (convertValue <= maxPages && convertValue > 0) {
        indices.push(convertValue - 1);
      }
    } else {
      const range = value.split("-");
      if (range.length === 2) {
        const start = parseInt(range[0]);
        const end = parseInt(range[1]);
        if (start < end) {
          for (let j = start; j <= end; j++) {
            if (j <= maxPages) {
              indices.push(j - 1);
            }
          }
        }
      }
    }
  }
  return indices;
};

// Event handler of merging file from the front-end
ipcMain.on("merge-files", async (event, filePaths: PDFFile[]) => {
  try {
    const result = await dialog.showSaveDialog({
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });
    if (!result.canceled && result.filePath) {
      const mergedPDF = await mergePDFs(filePaths);
      try {
        await fs.writeFile(result.filePath, mergedPDF, (err) => {
          if (err) throw err;
          event.reply("merge-complete", {
            status: "success",
            message: "Successfully merged the files: " + result.filePath,
          });
        });
      } catch (e) {
        event.reply("merge-complete", {
          status: "failed",
          message: "Could not save file!",
        });
      }
    } else {
      event.reply("merge-complete", {
        status: "canceled",
        message: "User canceled the dialog",
      });
    }
  } catch (e) {
    console.error(e);
    event.reply("merge-complete", {
      status: "failed",
      message: "Could not save or merge the files",
    });
  }
});
