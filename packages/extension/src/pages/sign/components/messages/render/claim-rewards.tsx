import React from "react";
import { IMessageRenderer } from "../types";

export const ClaimRewardsMessage: IMessageRenderer = {
  process(msg) {
    return {
      icon: <div>test</div>,
      title: "Claim rewards",
      content: "TODO",
    };
  },
};
