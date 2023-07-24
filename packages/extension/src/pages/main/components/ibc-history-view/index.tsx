import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  GetIBCTransferHistories,
  IBCTransferHistory,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { useLayoutEffectOnce } from "../../../../hooks/use-effect-once";

export const IbcHistoryView: FunctionComponent = observer(() => {
  const [histories, setHistories] = useState<IBCTransferHistory[]>([]);
  useLayoutEffectOnce(() => {
    const fn = () => {
      const requester = new InExtensionMessageRequester();
      const msg = new GetIBCTransferHistories();
      requester.sendMessage(BACKGROUND_PORT, msg).then((histories) => {
        setHistories(histories);
      });
    };

    fn();
    const interval = setInterval(fn, 3000);

    return () => {
      clearInterval(interval);
    };
  });

  console.log(histories);

  return <div />;
});
