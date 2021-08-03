/* eslint-disable no-param-reassign */
import * as React from 'react';
import { FunctionComponent, useState, useEffect, useCallback } from 'react';
import { ipcRenderer } from 'electron';
import _ from 'lodash';
import path from 'path';
import File from '../file/File';
import Button from '../button/Button';
import { ICPMergeMessage, PDFFile } from '../../interfaces';

// CSS
import './FileList.global.css';

interface Props {
  onUpdate?: (files: PDFFile[]) => void;
}

const FileList: FunctionComponent<Props> = (props: Props): JSX.Element => {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [error, setError] = useState<string>();
  const [dragStartIndex, setDragStartIndex] = useState<number>();
  const [, updateState] = useState<unknown>();
  const forceUpdate = useCallback(() => updateState({}), []);

  const update = useCallback(
    (fileList: PDFFile[]) => {
      props.onUpdate?.(fileList);
    },
    [props]
  );

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

  const isPDF = (file: File) => {
    return path.extname(file.path).toLowerCase() === '.pdf';
  };

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const newFiles: PDFFile[] = [];
      if (event.dataTransfer) {
        for (let i = 0; i < event.dataTransfer.files.length; i += 1) {
          const file = event.dataTransfer.files[i];
          if (isPDF(file)) {
            newFiles.push({ name: file.name, path: file.path, pages: 'all' });
          }
        }
        setFiles((prevState) => {
          prevState = _.unionWith(
            newFiles,
            prevState,
            (a, b) => a.name === b.name
          );
          update(prevState);
          return prevState;
        });
        forceUpdate();
      }

      return false;
    },
    [update]
  );

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  // Drag file for sorting
  const onDragFile = (
    event: DragEvent<HTMLDivElement>,
    draggedIndex: number
  ) => {
    event.preventDefault();
    setDragStartIndex(draggedIndex);
  };

  // Drop file for sorting
  const onDropFile = (
    event: DragEvent<HTMLDivElement>,
    droppedIndex: number
  ) => {
    event.preventDefault();
    if (dragStartIndex !== undefined && dragStartIndex !== droppedIndex) {
      setFiles((prevState) => {
        prevState.splice(
          droppedIndex,
          0,
          prevState.splice(dragStartIndex, 1)[0]
        );
        return prevState;
      });
    }

    setDragStartIndex(undefined);
  };

  const onComplete = useCallback(
    (event: any, message: ICPMergeMessage) => {
      if (message.status === 'failed') {
        setError(message.message);
      } else if (message.status === 'success') {
        setError('');
        setFiles([]);
        update([]);
      }
    },
    [update]
  );

  // on mount
  useEffect(() => {
    document.addEventListener('drop', onDrop);
    document.addEventListener('dragover', onDragOver);
    ipcRenderer.on('merge-complete', onComplete);

    return () => {
      // Removing events
      document.removeEventListener('drop', onDrop);
      document.removeEventListener('dragover', onDragOver);
      ipcRenderer.off('merge-complete', onComplete);
    };
  }, [onComplete, onDrop]);

  return (
    <div className="FileList">
      <div className="FileList-files">
        {files.map((file: PDFFile, index: number) => (
          <div
            key={file.name}
            draggable
            onDrag={(event: DragEvent<HTMLDivElement>) =>
              onDragFile(event, index)
            }
            onDrop={(event: DragEvent<HTMLDivElement>) =>
              onDropFile(event, index)
            }
          >
            <File
              fileName={file.name}
              onChange={(text: string) => {
                if (text.length === 0) {
                  text = 'all';
                }
                setPages(file.name, text);
              }}
              onRemove={() => {
                removeFile(file.name);
              }}
            />
          </div>
        ))}
      </div>
      <p className="FileList-drop-text">Drop files in here</p>
      <Button
        text="Merge"
        disabled={files.length === 0}
        onClick={() => {
          if (files.length > 0) {
            ipcRenderer.send('merge-files', files);
          }
        }}
      />
      <p id="error" className="error">
        {error}
      </p>
    </div>
  );
};

FileList.defaultProps = {
  onUpdate: undefined,
};

export default FileList;
