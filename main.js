// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const { ipcMain } = require("electron");
const { PDFDocument } = require("pdf-lib");

if (require("electron-squirrel-startup")) return app.quit();

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "icon.png"),
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
const mergePDFs = async (pdfs) => {
  const result = await PDFDocument.create();
  for (const pdf of pdfs) {
    const newPdf = await PDFDocument.load(pdf);
    const pagesArray = await result.copyPages(newPdf, newPdf.getPageIndices());
    for (const page of pagesArray) {
      result.addPage(page);
    }
  }

  return result.save();
};

ipcMain.on("merge-files", async (event, files) => {
  const pdfStreams = [];
  files.forEach(async (file) => {
    try {
      // Do whatever you want to do with the file
      if (path.extname(file).toLowerCase() === ".pdf") {
        console.log(`Adding ${file}`);
        await fs.readFile(file, (err, data) => {
          if (err) throw err;
          pdfStreams.push(data);
        });
      }
    } catch (e) {
      event.reply("merge-complete", {
        status: "failed",
        message: "Could not load the files",
      });
      return;
    }
  });
  try {
    const result = await dialog.showSaveDialog({
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });
    if (!result.canceled && result.filePath) {
      const mergedPDF = await mergePDFs(pdfStreams);
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
