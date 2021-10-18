import React, { FunctionComponent, useEffect, useRef } from "react";

import { HeaderLayout } from "../../layouts";

import { Card, CardBody } from "reactstrap";

import style from "./style.module.scss";
import { Menu } from "./menu";
import { AccountView } from "./account";
import { TxButtonView } from "./tx-button";
import { AssetView } from "./asset";
import { StakeView } from "./stake";

import classnames from "classnames";
import { useHistory } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { TokensView } from "./token";
import { BIP44SelectModal } from "./bip44-select-modal";
import { useIntl } from "react-intl";
import { useConfirm } from "../../components/confirm";
import { ChainUpdaterService } from "@keplr-wallet/background";
import { IBCTransferView } from "./ibc-transfer";
import { DenomHelper } from "@keplr-wallet/common";
import { Dec } from "@keplr-wallet/unit";
import { useLogScreenView } from "../../hooks";

export const MainPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const intl = useIntl();

  const { chainStore, accountStore, queriesStore } = useStore();

  const confirm = useConfirm();

  const currentChainId = chainStore.current.chainId;
  const prevChainId = useRef<string | undefined>();
  useEffect(() => {
    if (!chainStore.isInitializing && prevChainId.current !== currentChainId) {
      (async () => {
        const result = await ChainUpdaterService.checkChainUpdate(
          chainStore.current
        );
        if (result.explicit) {
          // If chain info has been changed, warning the user wether update the chain or not.
          if (
            await confirm.confirm({
              paragraph: intl.formatMessage({
                id: "main.update-chain.confirm.paragraph",
              }),
              yes: intl.formatMessage({
                id: "main.update-chain.confirm.yes",
              }),
              no: intl.formatMessage({
                id: "main.update-chain.confirm.no",
              }),
            })
          ) {
            await chainStore.tryUpdateChain(chainStore.current.chainId);
          }
        } else if (result.slient) {
          await chainStore.tryUpdateChain(chainStore.current.chainId);
        }
      })();

      prevChainId.current = currentChainId;
    }
  }, [chainStore, confirm, chainStore.isInitializing, currentChainId, intl]);

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(accountInfo.bech32Address);

  const tokens = queryBalances.unstakables.filter((bal) => {
    // Temporary implementation for trimming the 0 balanced native tokens.
    // TODO: Remove this part.
    if (new DenomHelper(bal.currency.coinMinimalDenom).type === "native") {
      return bal.balance.toDec().gt(new Dec("0"));
    }
    return true;
  });

  const hasTokens = tokens.length > 0;

  useLogScreenView("Home Dashboard");

  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo
      menuRenderer={<Menu />}
      rightRenderer={
        <div
          style={{
            height: "64px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            paddingRight: "20px",
          }}
        >
          <i
            className="fas fa-user"
            style={{
              cursor: "pointer",
              padding: "4px",
            }}
            onClick={(e) => {
              e.preventDefault();

              history.push("/setting/set-keyring");
            }}
          />
        </div>
      }
    >
      <BIP44SelectModal />
      <Card className={classnames(style.card, "shadow")}>
        <CardBody>
          <div className={style.containerAccountInner}>
            <AccountView />
            <AssetView />
            <TxButtonView />
          </div>
        </CardBody>
      </Card>
      {chainStore.current.walletUrlForStaking ? (
        <Card className={classnames(style.card, "shadow")}>
          <CardBody>
            <StakeView />
          </CardBody>
        </Card>
      ) : null}
      {hasTokens ? (
        <Card className={classnames(style.card, "shadow")}>
          <CardBody>{<TokensView />}</CardBody>
        </Card>
      ) : null}
      {chainStore.current.features?.includes("ibc-transfer") ? (
        <Card className={classnames(style.card, "shadow")}>
          <CardBody>
            <IBCTransferView />
          </CardBody>
        </Card>
      ) : null}
    </HeaderLayout>
  );
});
