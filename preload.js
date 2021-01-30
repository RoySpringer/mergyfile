// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { ipcRenderer } = require("electron");
let files = [];

document.addEventListener("drop", function (event) {
  event.preventDefault();
  event.stopPropagation();
  for (let file of event.dataTransfer.files) {
    files.push(file);
  }
  updateComponents();
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
};

const updateIcon = () => {
  const image = document.getElementById("imageAdd");
  if (files.length > 0) {
    image.src = "./assets/pdf merge.svg";
  } else {
    image.src = "./assets/pdf add.svg";
  }
};

const updateButton = () => {
  if (files.length > 0) {
    document.getElementById("merge").classList.remove("disabled");
  } else {
    document.getElementById("merge").classList.add("disabled");
  }
};

const removeFile = (name) => {
  const index = files.findIndex((el) => el.name === name);
  if (index !== -1) {
    files.splice(index, 1);
    updateComponents();
  }
};

const updateComponents = () => {
  updateFiles();
  updateIcon();
  updateButton();
};

ipcRenderer.on("merge-complete", (event, messageObj) => {
  if (messageObj.status === "failed") {
    document.getElementById("error").innerText = messageObj.message;
  } else if (messageObj.status === "success") {
    document.getElementById("error").innerText = "";
    document.getElementById("files").innerText = messageObj.message;
    files = [];
    updateComponents();
  }
});
