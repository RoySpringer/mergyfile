import * as React from "react";
import { FunctionComponent, useEffect, createRef, useState } from "react";

// CSS
import "./Button.css";

interface Props {
  text: string;
  size?: "small" | "normal";
  disabled?: boolean;
  onClick?: (event: any) => void;
}

const Button: FunctionComponent<Props> = (props: Props): JSX.Element => {
  const button = createRef<HTMLDivElement>();
  const [disabled, setDisabled] = useState(props.disabled ?? false);
  const size = props.size ?? "normal";

  const onClick = (event: any) => {
    if (props.onClick && !props.disabled) {
      props.onClick(event);
    }
  };
  return (
    <div
      className={
        "Button btn-primary " + size + " " + (props.disabled ? "disabled" : "")
      }
      onClick={onClick}
    >
      {props.text}
    </div>
  );
};

export default Button;
