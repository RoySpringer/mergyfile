const PDFMerger = require("pdf-merger-js");
const merger = new PDFMerger();

//requiring path and fs modules
const path = require("path");
const fs = require("fs");
//joining path of directory
const directoryPath = path.join(__dirname, "input");
const outputPath = path.join(__dirname, "output");

//passsing directoryPath and callback function
fs.readdir(directoryPath, async function (err, files) {
  //handling error
  if (err) {
    return console.log("Unable to scan directory: " + err);
  }
  //listing all files using forEach
  files.forEach(function (file) {
    // Do whatever you want to do with the file
    if (path.extname(file).toLowerCase() === ".pdf") {
      console.log(`Adding ${file}`);
      merger.add(`${directoryPath}/${file}`);
    }
  });
  try {
    await merger.save(outputPath + "/merged.pdf");
  } catch (e) {
    console.error(e);
  }
});
