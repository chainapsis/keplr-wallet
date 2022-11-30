import React, { FunctionComponent, useEffect, useState } from "react";
import { Button, Modal, ModalBody } from "reactstrap";
import style from "./ledger-app-modal.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT, KeplrError } from "@keplr-wallet/router";
import {
  InitNonDefaultLedgerAppMsg,
  LedgerApp,
} from "@keplr-wallet/background";

export const LedgerAppModal: FunctionComponent = observer(() => {
  const { chainStore, accountStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  // [prev, current]
  const [prevChainId, setPrevChainId] = useState<[string | undefined, string]>(
    () => [undefined, chainStore.current.chainId]
  );
  useEffect(() => {
    setPrevChainId((state) => {
      if (state[1] !== chainStore.current.chainId) {
        return [state[1], chainStore.current.chainId];
      } else {
        return [state[0], state[1]];
      }
    });
  }, [chainStore, chainStore.current.chainId]);

  const [isLoading, setIsLoading] = useState(false);

  const isOpen = (() => {
    if (
      accountInfo.rejectionReason &&
      accountInfo.rejectionReason instanceof KeplrError
    ) {
      if (
        accountInfo.rejectionReason.module === "keyring" &&
        accountInfo.rejectionReason.code === 901
      ) {
        return true;
      }
    }

    return false;
  })();

  return (
    <Modal isOpen={isOpen} centered>
      <ModalBody>
        <div className={style.title}>Please Connect your Ledger device</div>
        <div className={style.paragraph}>
          For making address of {chainStore.current.chainName}, you need to
          connect your Ledger device through Ethereum app
        </div>
        <div
          style={{
            display: "flex",
          }}
        >
          <Button
            type="button"
            color="primary"
            outline
            block
            style={{ margin: 0 }}
            data-loading={isLoading}
            onClick={(e) => {
              e.preventDefault();

              if (prevChainId[0]) {
                chainStore.selectChain(prevChainId[0]);
              } else {
                chainStore.selectChain(chainStore.chainInfos[0].chainId);
              }
              chainStore.saveLastViewChainId();
            }}
          >
            Cancel
          </Button>
          <div style={{ width: "32px" }} />
          <Button
            type="button"
            color="primary"
            block
            style={{ margin: 0 }}
            data-loading={isLoading}
            onClick={async () => {
              setIsLoading(true);

              try {
                await new InExtensionMessageRequester().sendMessage(
                  BACKGROUND_PORT,
                  new InitNonDefaultLedgerAppMsg(LedgerApp.Ethereum)
                );

                accountInfo.disconnect();

                await accountInfo.init();
              } catch (e) {
                console.log(e);
              } finally {
                setIsLoading(false);
              }
            }}
          >
            Connect
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
});
