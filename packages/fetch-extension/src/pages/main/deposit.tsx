import React, { useState, FunctionComponent, useCallback } from "react";
import { Button } from "reactstrap";

import styleDeposit from "./deposit.module.scss";
import classnames from "classnames";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useNotification } from "@components/notification";
import { useIntl } from "react-intl";
import { WalletStatus } from "@keplr-wallet/stores";
import { FormattedMessage } from "react-intl";
import { DepositModal } from "./qr-code";
import { useBuy } from "@hooks/use-buy";
import Modal from "react-modal";
import { BuyModalContent } from "./asset";

export const DepositView: FunctionComponent = observer(() => {
  const { accountStore, chainStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const intl = useIntl();

  const notification = useNotification();

  const copyAddress = useCallback(
    async (address: string) => {
      if (accountInfo.walletStatus === WalletStatus.Loaded) {
        await navigator.clipboard.writeText(address);
        notification.push({
          placement: "top-center",
          type: "success",
          duration: 2,
          content: intl.formatMessage({
            id: "main.address.copied",
          }),
          canDelete: true,
          transition: {
            duration: 0.25,
          },
        });
      }
    },
    [accountInfo.walletStatus, notification, intl]
  );

  const { isBuySupportChain, buySupportServiceInfos } = useBuy();
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  return (
    <div>
      <div className={styleDeposit["containerInner"]}>
        <DepositModal
          chainName={chainStore.current.chainName}
          bech32Address={accountInfo.bech32Address}
          isDepositOpen={isDepositOpen}
          setIsDepositOpen={setIsDepositOpen}
        />

        <div className={styleDeposit["vertical"]}>
          <p
            className={classnames(
              "h4",
              "my-0",
              "font-weight-normal",
              styleDeposit["paragraphMain"]
            )}
          >
            <FormattedMessage id="main.account.button.deposit" />{" "}
            {chainStore.current.stakeCurrency.coinDenom.toUpperCase()}
          </p>
          <p
            className={classnames(
              "h5",
              "my-0",
              "font-weight-normal",
              styleDeposit["paragraphSub"]
            )}
          >
            <FormattedMessage id="main.account.deposit.paragraph" />
          </p>
        </div>
        <div style={{ flex: 1 }} />
        <Button
          className={styleDeposit["button"]}
          color="primary"
          size="sm"
          onClick={async (e) => {
            e.preventDefault();
            await copyAddress(accountInfo.bech32Address);
            setIsDepositOpen(true);
          }}
        >
          <FormattedMessage id="main.account.button.deposit" />
        </Button>
      </div>

      {(chainStore.current.chainId == "fetchhub-4" || isBuySupportChain) && (
        <div>
          <hr className={styleDeposit["hr"]} />

          <div className={styleDeposit["containerInner"]}>
            <div className={styleDeposit["vertical"]}>
              <p
                className={classnames(
                  "h4",
                  "my-0",
                  "font-weight-normal",
                  styleDeposit["paragraphMain"]
                )}
              >
                <FormattedMessage id="main.account.button.buy" />{" "}
                {chainStore.current.stakeCurrency.coinDenom.toUpperCase()}
              </p>
              <p
                className={classnames(
                  "h5",
                  "my-0",
                  "font-weight-normal",
                  styleDeposit["paragraphSub"]
                )}
              >
                <FormattedMessage id="main.account.buy.paragraph" />
              </p>
            </div>
            <div style={{ flex: 1 }} />

            <Button
              className={styleDeposit["button"]}
              color="primary"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                if (chainStore.current.chainId == "fetchhub-4") {
                  window.open("https://fetch.ai/get-fet/", "_blank");
                }
                if (isBuySupportChain) {
                  setIsBuyModalOpen(true);
                }
              }}
            >
              <FormattedMessage id="main.account.button.buy" />
            </Button>
          </div>
        </div>
      )}
      <Modal
        style={{
          content: {
            width: "330px",
            minWidth: "330px",
            minHeight: "unset",
            maxHeight: "unset",
          },
        }}
        isOpen={isBuyModalOpen}
        onRequestClose={() => {
          setIsBuyModalOpen(false);
        }}
      >
        <BuyModalContent buySupportServiceInfos={buySupportServiceInfos} />
      </Modal>
    </div>
  );
});
