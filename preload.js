// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { ipcRenderer } = require("electron");
const files = [];

document.addEventListener("drop", function (event) {
  event.preventDefault();
  event.stopPropagation();
  for (let file of event.dataTransfer.files) {
    files.push(file);
  }
  updateFiles();
  return false;
});

document.addEventListener("dragover", function (e) {
  e.preventDefault();
  e.stopPropagation();
});

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("merge").addEventListener("click", async () => {
    if (files.length > 0) {
      const paths = files.map((f) => f.path);
      ipcRenderer.send("merge-files", paths);
    }
  });
});

const updateFiles = () => {
  const filesEl = document.getElementById("files");
  filesEl.innerHTML = "";
  files.forEach((file) => {
    filesEl.innerHTML += `<div class="file">
      <p>${file.name}</p>
      <div class="file-end">
        <!--<input type="text"/>-->
        <p class="button btn-primary btn-small" id="${file.name}">remove</p>
      </div>
    </div>`;
  });
  files.forEach((file) => {
    document.getElementById(file.name).addEventListener("click", () => {
      removeFile(file.name);
    });
  });
  updateIcon();
};

const updateIcon = () => {
  const image = document.getElementById("imageAdd");
  if (files.length > 0) {
    image.src = "./assets/pdf merge.svg";
  } else {
    image.src = "./assets/pdf add.svg";
  }
};

const removeFile = (name) => {
  const index = files.findIndex((el) => el.name === name);
  if (index !== -1) {
    files.splice(index, 1);
    updateFiles();
  }
};

ipcRenderer.on("merge-complete", () => console.log("complete"));
