import * as React from 'react';
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import Button from '../button/Button';

// CSS
import './File.global.css';

interface Props {
  fileName: string;
  onChange: (text: string) => void;
  onRemove: () => void;
}

const File: FunctionComponent<Props> = (props: Props): JSX.Element => {
  const [value, setValue] = useState<string>('');
  const fileNameShortend = useRef<string>(props.fileName);
  useEffect(() => {
    const { fileName } = props;
    if (fileName.length > 30) {
      const start = fileName.substring(0, 15);
      const end = fileName.substring(fileName.length - 15, fileName.length);
      fileNameShortend.current = `${start}...${end}`;
    }
  }, [props]);

  return (
    <div className="File">
      <p>{fileNameShortend.current}</p>
      <div className="File-end">
        <input
          className="File-pages"
          value={value}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setValue(event.currentTarget.value);
            props.onChange(event.currentTarget.value);
          }}
          placeholder="e.g. 1,2,7-9"
        />
        <Button size="small" text="Remove" onClick={props.onRemove} />
      </div>
    </div>
  );
};

export default File;
