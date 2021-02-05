/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import fs from 'fs';
import path from 'path';
import { app, BrowserWindow, shell, dialog, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { PDFDocument } from 'pdf-lib';
import { PDFFile } from './interfaces';
import MenuBuilder from './menu';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// Merging the pdf files
const mergePDFs = async (pdfs: PDFFile[]): Promise<Uint8Array> => {
  const result = await PDFDocument.create();
  for (const pdf of pdfs) {
    const pdfBuffer = fs.readFileSync(pdf.path);
    const newPdf = await PDFDocument.load(pdfBuffer);
    let pageIndicesArray = [];
    if (pdf.pages === 'all') {
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
  pages = pages.replace(/[^0-9-,]/gi, '');
  const values = pages.split(',');
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value.indexOf('-') === -1) {
      const convertValue = parseInt(value);
      if (convertValue <= maxPages && convertValue > 0) {
        indices.push(convertValue - 1);
      }
    } else {
      const range = value.split('-');
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
ipcMain.on('merge-files', async (event, filePaths: PDFFile[]) => {
  try {
    const result = await dialog.showSaveDialog({
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });
    if (!result.canceled && result.filePath) {
      const mergedPDF = await mergePDFs(filePaths);
      try {
        await fs.writeFile(result.filePath, mergedPDF, (err) => {
          if (err) throw err;
          event.reply('merge-complete', {
            status: 'success',
            message: 'Successfully merged the files: ' + result.filePath,
          });
        });
      } catch (e) {
        event.reply('merge-complete', {
          status: 'failed',
          message: 'Could not save file!',
        });
      }
    } else {
      event.reply('merge-complete', {
        status: 'canceled',
        message: 'User canceled the dialog',
      });
    }
  } catch (e) {
    console.error(e);
    event.reply('merge-complete', {
      status: 'failed',
      message: 'Could not save or merge the files. \nPlease check the files.',
    });
  }
});
