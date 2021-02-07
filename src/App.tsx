import * as React from 'react';
import { FunctionComponent, useState } from 'react';
import Icon, { IconType } from './components/icon/Icon';
import FileList from './components/fileList/FileList';
import { ReactComponent as AppIcon } from '../assets/icon_no_bg.svg';

import './App.global.css';

interface Props {
  appName?: string;
}

const App: FunctionComponent<Props> = () => {
  const [iconType, setIconType] = useState<IconType>({ type: 'add' });

  return (
    <div className="App absoluteFill">
      <header className="App-header">
        <AppIcon width="100%" height="100" viewBox="0 0 1005 383" />
      </header>
      <div className="App-container">
        <Icon iconType={iconType} />
        <FileList
          onUpdate={(files) => {
            if (files.length > 0) {
              setIconType({ type: 'merge' });
            } else {
              setIconType({ type: 'add' });
            }
          }}
        />
      </div>
      <footer className="App-footer">
        <div className="App-footer-credits">
          <p>
            Icons made by{' '}
            <a
              href="https://www.flaticon.com/authors/icon-monk"
              title="Icon Monk"
            >
              Icon Monk
            </a>{' '}
            from{' '}
            <a href="https://www.flaticon.com/" title="Flaticon">
              www.flaticon.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
