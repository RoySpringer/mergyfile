import * as React from "react";
import { FunctionComponent, useEffect, useState } from "react";

import { ReactComponent as AddPDF } from "../../assets/pdf_add.svg";
import { ReactComponent as MergePDF } from "../../assets/pdf_merge.svg";
// CSS
import "./Icon.css";

export type IconType = {
  type: "add" | "merge";
};

interface Props {
  iconType: IconType;
}

const Icon: FunctionComponent<Props> = (props: Props): JSX.Element => {
  return (
    <div className={"Icon"}>
      {props.iconType.type === "add" ? <AddPDF /> : <MergePDF />}
    </div>
  );
};

export default Icon;
