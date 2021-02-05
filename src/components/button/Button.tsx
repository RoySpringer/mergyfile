import * as React from 'react';
import { FunctionComponent } from 'react';

// CSS
import './Button.global.css';

interface Props {
  text: string;
  size?: 'small' | 'normal';
  disabled?: boolean;
  onClick?: (event: any) => void;
}

const Button: FunctionComponent<Props> = (props: Props): JSX.Element => {
  const onClick = (event: any) => {
    if (props.onClick && !props.disabled) {
      props.onClick(event);
    }
  };
  return (
    <button
      className={`Button btn-primary ${props.size} ${
        props.disabled ? 'disabled' : ''
      }`}
      onClick={onClick}
      type="button"
    >
      {props.text}
    </button>
  );
};
Button.defaultProps = {
  size: 'normal',
  disabled: false,
  onClick: () => {},
};

export default Button;
