import React, { FunctionComponent } from "react";
import { MsgHistory } from "../types";
import { observer } from "mobx-react-lite";
import { MsgItemBase } from "./base";
import { ItemLogo } from "./logo";
import { MessageCustomIcon } from "../../../../components/icon";

export const MsgRelationAtomoneMintPhoton: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({ msg, prices, targetDenom, isInAllActivitiesPage }) => {
  return (
    <MsgItemBase
      logo={
        <ItemLogo center={<MessageCustomIcon width="2rem" height="2rem" />} />
      }
      chainId={msg.chainId}
      title="Mint Photon"
      amount={""}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});
