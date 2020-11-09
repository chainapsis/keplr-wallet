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
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { useConfirm } from "../../../components/confirm";
import { useIntl } from "react-intl";
import { TokensView } from "./token";
import { Int } from "@chainapsis/cosmosjs/common/int";
import { ChainUpdaterKeeper } from "../../../../background/updater/keeper";
import { sendMessage } from "../../../../common/message/send";
import { GetExistentAccountsFromBIP44sMsg } from "../../../../background/keyring";
import { BACKGROUND_PORT } from "../../../../common/message/constant";

export const MainPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const intl = useIntl();

  const { chainStore, accountStore } = useStore();

  const confirm = useConfirm();

  const prevChainId = useRef<string | undefined>();
  useEffect(() => {
    if (prevChainId.current !== chainStore.chainInfo.chainId) {
      console.log(prevChainId.current, chainStore.chainInfo.chainId);
      // FIXME: This will be executed twice on initial because chain store set the chain info on constructor and init.
      (async () => {
        console.log(
          await sendMessage(
            BACKGROUND_PORT,
            new GetExistentAccountsFromBIP44sMsg(chainStore.chainInfo.chainId, [
              chainStore.chainInfo.bip44,
              ...(chainStore.chainInfo.alternativeBIP44s ?? [])
            ])
          )
        );

        if (await ChainUpdaterKeeper.checkChainUpdate(chainStore.chainInfo)) {
          // If chain info has been changed, warning the user wether update the chain or not.
          if (
            await confirm.confirm({
              paragraph: intl.formatMessage({
                id: "main.update-chain.confirm.paragraph"
              }),
              yes: intl.formatMessage({
                id: "main.update-chain.confirm.yes"
              }),
              no: intl.formatMessage({
                id: "main.update-chain.confirm.no"
              })
            })
          ) {
            await chainStore.tryUpdateChain(chainStore.chainInfo.chainId);
          }
        }
      })();
    }

    prevChainId.current = chainStore.chainInfo.chainId;
  }, [chainStore, chainStore.chainInfo, confirm, intl]);

  const stakeCurrency = chainStore.chainInfo.stakeCurrency;

  const tokens = accountStore.assets.filter(asset => {
    return (
      asset.denom !== stakeCurrency.coinMinimalDenom &&
      asset.amount.gt(new Int(0))
    );
  });

  const hasTokens = tokens.length > 0;

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
            paddingRight: "20px"
          }}
        >
          <i
            className="fas fa-user"
            style={{
              cursor: "pointer",
              padding: "4px"
            }}
            onClick={e => {
              e.preventDefault();

              history.push("/setting/set-keyring");
            }}
          />
        </div>
      }
    >
      <Card className={classnames(style.card, "shadow")}>
        <CardBody>
          <div className={style.containerAccountInner}>
            <AccountView />
            <AssetView />
            <TxButtonView />
          </div>
        </CardBody>
      </Card>
      {chainStore.chainInfo.walletUrlForStaking ? (
        <Card className={classnames(style.card, "shadow")}>
          <CardBody>
            <StakeView />
          </CardBody>
        </Card>
      ) : null}
      {hasTokens ? (
        <Card className={classnames(style.card, "shadow")}>
          <CardBody>
            <TokensView tokens={tokens} />
          </CardBody>
        </Card>
      ) : null}
    </HeaderLayout>
  );
});
