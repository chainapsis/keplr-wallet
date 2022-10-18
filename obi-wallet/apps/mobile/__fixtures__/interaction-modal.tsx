import {
  isMultisigWallet,
  RequestObiSignAndBroadcastMsg,
} from "@obi-wallet/common";
import { useEffect } from "react";

import { InteractionModal } from "../src/app/modals/interaction-modal";
import { useStore } from "../src/app/stores";

// eslint-disable-next-line import/no-default-export
export default () => {
  const { walletsStore } = useStore();

  useEffect(() => {
    (async () => {
      if (!walletsStore.currentWalletId) return;
      await RequestObiSignAndBroadcastMsg.send({
        id: walletsStore.currentWalletId,
        multisig: isMultisigWallet(walletsStore.currentWallet)
          ? walletsStore.currentWallet.nextAdmin
          : null,
        encodeObjects: [],
      });
    })();
  }, [walletsStore]);

  return <InteractionModal />;
};
