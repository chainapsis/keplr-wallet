import React from "react";
import SimpleBarCore from "simplebar-core";

export interface GlobalSimpleBar {
  ref: React.MutableRefObject<SimpleBarCore | null>;
}
