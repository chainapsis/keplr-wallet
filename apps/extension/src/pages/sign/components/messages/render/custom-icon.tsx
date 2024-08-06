import React, { FunctionComponent } from "react";
import { ItemLogo } from "../../../../main/token-detail/msg-items/logo";
import { MessageCustomIcon } from "../../../../../components/icon";

export const CustomIcon: FunctionComponent = () => {
  return (
    <ItemLogo
      width="2.5rem"
      height="2.5rem"
      center={<MessageCustomIcon width="2.5rem" height="2.5rem" />}
    />
  );
};
