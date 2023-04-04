import React, { FunctionComponent, useEffect, useRef } from "react";

import { HeaderLayout } from "@layouts/index";

import { Card, CardBody } from "reactstrap";

import { ChainUpdaterService } from "@keplr-wallet/background";
import classnames from "classnames";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { useConfirm } from "@components/confirm";
import { SwitchUser } from "@components/switch-user";
import { useStore } from "../../stores";
import { AccountView } from "./account";
import { AssetView } from "./asset";
import { BIP44SelectModal } from "./bip44-select-modal";
import { Menu } from "./menu";
import style from "./style.module.scss";
import { TokensView } from "./token";
import { ChatDisclaimer } from "@components/chat/chat-disclaimer";
import { AUTH_SERVER } from "../../config.ui.var";
import { getJWT } from "@utils/auth";
import { store } from "@chatStore/index";
import { setAccessToken, setWalletConfig } from "@chatStore/user-slice";
import { getWalletConfig } from "@graphQL/config-api";

export const MainPage: FunctionComponent = observer(() => {
  const intl = useIntl();

  const { keyRingStore, chainStore, accountStore, queriesStore } = useStore();

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

  // const tokens = queryBalances.unstakables.filter((bal) => {
  //   // Temporary implementation for trimming the 0 balanced native tokens.
  //   // TODO: Remove this part.
  //   if (new DenomHelper(bal.currency.coinMinimalDenom).type === "native") {
  //     return bal.balance.toDec().gt(new Dec("0"));
  //   }
  //   return true;
  // });

  // const hasTokens = tokens.length > 0;

  /// Fetching wallet config info
  useEffect(() => {
    if (keyRingStore.keyRingType === "ledger") {
      return;
    }
    getJWT(chainStore.current.chainId, AUTH_SERVER).then((res) => {
      store.dispatch(setAccessToken(res));
      getWalletConfig()
        .then((config) => store.dispatch(setWalletConfig(config)))
        .catch((error) => {
          console.log(error);
        });
    });
  }, [chainStore.current.chainId, accountInfo.bech32Address]);

  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo
      menuRenderer={<Menu />}
      rightRenderer={<SwitchUser />}
    >
      <BIP44SelectModal />
      <ChatDisclaimer />
      <Card className={classnames(style.card, "shadow")}>
        <CardBody>
          <div className={style.containerAccountInner}>
            <AccountView />
            <AssetView />
          </div>
        </CardBody>
      </Card>

      {queryBalances.unstakables.length > 0 && (
        <Card className={classnames(style.card, "shadow")}>
          <CardBody>
            <div className={style.containerAccountInner}>
              <TokensView />
            </div>
          </CardBody>
        </Card>
      )}
    </HeaderLayout>
  );
});
