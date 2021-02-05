import * as React from 'react';
import { FunctionComponent, useState } from 'react';

import Button from '../button/Button';

// CSS
import './File.global.css';

interface Props {
  fileName: string;
  onChange: (text: string) => void;
  onRemove: () => void;
}

const File: FunctionComponent<Props> = (props: Props): JSX.Element => {
  const [value, setValue] = useState('');

  return (
    <div className="File">
      <p>{props.fileName}</p>
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
