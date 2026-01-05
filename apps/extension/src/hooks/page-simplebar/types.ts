import React from "react";
import SimpleBarCore from "simplebar-core";

export interface PageSimpleBar {
  ref: React.MutableRefObject<SimpleBarCore | null>;
}
