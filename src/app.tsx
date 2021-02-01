import * as React from "react";
import { FunctionComponent, useState, useEffect } from "react";
import * as ReactDOM from "react-dom";
import Icon, { IconType } from "./components/icon/Icon";
import FileList from "./components/fileList/FileList";
import Button from "./components/button/Button";
import { PDFFile, ICPMergeMessage } from "./interfaces";
import { ipcRenderer } from "electron";

import "./App.css";

interface Props {
  appName?: string;
}

const App: FunctionComponent<Props> = () => {
  const [iconType, setIconType] = useState<IconType>({ type: "add" });
  const [error, setError] = useState<string>("");
  const [files, setFiles] = useState<PDFFile[]>([]);

  const onComplete = (event: any, message: ICPMergeMessage) => {
    if (message.status === "failed") {
      setError(message.message);
    } else if (message.status === "success") {
      setError("");
    }
  };

  return (
    <div className="App absoluteFill">
      <header className="App-header">
        <h1 className="App-header-h1 shadow-text">Mergyfile</h1>
      </header>
      <div className="App-container">
        <Icon iconType={iconType} />
        <FileList
          files={[]}
          onUpdate={(files) => {
            if (files.length > 0) {
              setIconType({ type: "merge" });
            } else {
              setIconType({ type: "add" });
            }
          }}
        />
      </div>
      <footer className="App-footer">
        <div className="App-footer-credits">
          <p>
            Icons made by{" "}
            <a
              href="https://www.flaticon.com/authors/icon-monk"
              title="Icon Monk"
            >
              Icon Monk
            </a>{" "}
            from{" "}
            <a href="https://www.flaticon.com/" title="Flaticon">
              www.flaticon.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

function render() {
  ReactDOM.render(<App />, document.getElementById("root"));
}

render();
