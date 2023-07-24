import React, { FunctionComponent, useEffect, useRef } from "react";

import { HeaderLayout } from "@layouts/index";

import { Card, CardBody } from "reactstrap";

import classnames from "classnames";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { useConfirm } from "@components/confirm";
import { SwitchUser } from "@components/switch-user";
import { useStore } from "../../stores";
import { AccountView } from "./account";
import { AssetView } from "./asset";
import { BIP44SelectModal } from "./bip44-select-modal";
import { VestingInfo } from "./vesting-info";
import { LedgerAppModal } from "./ledger-app-modal";
import { EvmosDashboardView } from "./evmos-dashboard";
import { AuthZView } from "./authz";
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

  const {
    chainStore,
    accountStore,
    queriesStore,
    keyRingStore,
    analyticsStore,
  } = useStore();

  useEffect(() => {
    analyticsStore.logEvent("Home tab click");
    analyticsStore.setUserProperties({
      totalAccounts: keyRingStore.multiKeyStoreInfo.length,
    });
  }, [analyticsStore, keyRingStore.multiKeyStoreInfo.length]);

  const confirm = useConfirm();

  const current = chainStore.current;
  const currentChainId = current.chainId;
  const prevChainId = useRef<string | undefined>();
  useEffect(() => {
    if (!chainStore.isInitializing && prevChainId.current !== currentChainId) {
      (async () => {
        try {
          await chainStore.tryUpdateChain(chainStore.current.chainId);
        } catch (e) {
          console.log(e);
        }
      })();

      prevChainId.current = currentChainId;
    }
  }, [chainStore, confirm, chainStore.isInitializing, currentChainId, intl]);

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const queryAccount = queriesStore
    .get(chainStore.current.chainId)
    .cosmos.queryAccount.getQueryBech32Address(accountInfo.bech32Address);
  // Show the spendable balances if the account is vesting account.
  const showVestingInfo = (() => {
    // If the chain can't query /cosmos/bank/v1beta1/spendable_balances/{account},
    // no need to show the vesting info because its query always fails.
    if (
      !current.features ||
      !current.features.includes(
        "query:/cosmos/bank/v1beta1/spendable_balances"
      )
    ) {
      return false;
    }

    return (
      !queryAccount.error &&
      queryAccount.response &&
      queryAccount.isVestingAccount
    );
  })();

  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(accountInfo.bech32Address);

  const queryAuthZGrants = queriesStore
    .get(chainStore.current.chainId)
    .cosmos.queryAuthZGranter.getGranter(accountInfo.bech32Address);

  // const tokens = queryBalances.unstakables.filter((bal) => {
  //   if (
  //     chainStore.current.features &&
  //     chainStore.current.features.includes("terra-classic-fee")
  //   ) {
  //     // At present, can't handle stability tax well if it is not registered native token.
  //     // So, for terra classic, disable other tokens.
  //     const denom = new DenomHelper(bal.currency.coinMinimalDenom);
  //     if (denom.type !== "native" || denom.denom.startsWith("ibc/")) {
  //       return false;
  //     }
  //
  //     if (denom.type === "native") {
  //       return bal.balance.toDec().gt(new Dec("0"));
  //     }
  //   }
  //
  //   // Temporary implementation for trimming the 0 balanced native tokens.
  //   // TODO: Remove this part.
  //   if (new DenomHelper(bal.currency.coinMinimalDenom).type === "native") {
  //     return bal.balance.toDec().gt(new Dec("0"));
  //   }
  //   return true;
  // });

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
      <LedgerAppModal />
      <Card className={classnames(style["card"], "shadow")}>
        <CardBody>
          <div className={style["containerAccountInner"]}>
            <AccountView />
            <AssetView />
          </div>
        </CardBody>
      </Card>

      {showVestingInfo ? <VestingInfo /> : null}

      {queryBalances.unstakables.length > 0 && (
        <Card className={classnames(style["card"], "shadow")}>
          <CardBody>
            <div className={style["containerAccountInner"]}>
              <TokensView />
            </div>
          </CardBody>
        </Card>
      )}
      {chainStore.current.chainId === "evmos_9001-2" && (
        <Card className={classnames(style["card"], "shadow")}>
          <CardBody>
            <EvmosDashboardView />
          </CardBody>
        </Card>
      )}

      {queryAuthZGrants.response?.data.grants.length ? (
        <Card className={classnames(style["card"], "shadow")}>
          <CardBody>
            <AuthZView grants={queryAuthZGrants.response.data.grants} />
          </CardBody>
        </Card>
      ) : null}
    </HeaderLayout>
  );
});
