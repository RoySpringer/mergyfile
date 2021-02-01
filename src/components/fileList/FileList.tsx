import * as React from "react";
import { FunctionComponent, useState, useEffect, useCallback } from "react";
import { ipcRenderer } from "electron";
import File from "../file/File";
import Button from "../button/Button";
import { ICPMergeMessage, PDFFile } from "../../interfaces";
import _ from "lodash";
import path from "path";

// CSS
import "./FileList.css";

interface Props {
  files: PDFFile[];
  onUpdate?: (files: PDFFile[]) => void;
}

const FileList: FunctionComponent<Props> = (props: Props): JSX.Element => {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [error, setError] = useState<string>();

  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);

  const removeFile = (fileName: string) => {
    setFiles((prevState) => {
      const index = prevState.findIndex((file) => file.name === fileName);
      if (index !== -1) {
        prevState.splice(index, 1);
      }
      update(prevState);
      return prevState;
    });
    forceUpdate();
  };

  const setPages = (fileName: string, pages: string) => {
    setFiles((prevState) => {
      const index = prevState.findIndex((file) => file.name === fileName);
      if (index !== -1) {
        prevState[index].pages = pages;
      }
      update(prevState);
      return prevState;
    });
    forceUpdate();
  };

  const update = (files: PDFFile[]) => {
    if (props.onUpdate) {
      props.onUpdate(files);
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const newFiles: PDFFile[] = [];
    for (let i = 0; i < event.dataTransfer.files.length; i++) {
      const file = event.dataTransfer.files[i];
      if (isPDF(file)) {
        newFiles.push({ name: file.path, pages: "all" });
      }
    }
    setFiles((prevState) => {
      prevState = _.unionWith(newFiles, prevState, (a, b) => a.name === b.name);
      update(prevState);
      return prevState;
    });
    forceUpdate();

    return false;
  };

  const isPDF = (file: File) => {
    return path.extname(file.path).toLowerCase() === ".pdf";
  };

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onComplete = (event: any, message: ICPMergeMessage) => {
    if (message.status === "failed") {
      setError(message.message);
    } else if (message.status === "success") {
      setError("");
    }
  };

  // on mount
  useEffect(() => {
    document.addEventListener("drop", onDrop);
    document.addEventListener("dragover", onDragOver);
    ipcRenderer.on("merge-complete", onComplete);

    return () => {
      // Removing events
      document.removeEventListener("drop", onDrop);
      document.removeEventListener("dragover", onDragOver);
      ipcRenderer.off("merge-complete", onComplete);
    };
  }, []);

  return (
    <div className={"FileList"}>
      <div className={"FileList-files"}>
        {files.map((file: PDFFile, index: number) => (
          <File
            key={index}
            fileName={file.name}
            onChange={(text: string) => {
              if (text.length === 0) {
                text = "all";
              }
              setPages(file.name, text);
            }}
            onRemove={() => {
              removeFile(file.name);
            }}
          />
        ))}
      </div>
      <p className="FileList-drop-text">Drop files in here</p>
      <Button
        text={"Merge"}
        onClick={() => {
          if (files.length > 0) {
            ipcRenderer.send("merge-files", files);
          }
        }}
      />
      <p id="error" className="error">
        {error}
      </p>
    </div>
  );
};

export default FileList;
