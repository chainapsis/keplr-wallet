import React, { FunctionComponent, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import style from "../../style.module.scss";
import { useIntl } from "react-intl";
import { useConfirm } from "@components/confirm";
import { Secret20ViewingKeyPermissionInnerStore } from "@keplr-wallet/stores";
import { HeaderLayout } from "@layouts-v2/header-layout";
import { Card } from "@components-v2/card";

export const SettingSecret20ViewingKeyConnectionsPage: FunctionComponent =
  observer(() => {
    const { contractAddress } = useParams<{ contractAddress?: string }>();

    const intl = useIntl();
    const navigate = useNavigate();
    const confirm = useConfirm();

    const { chainStore, permissionStore, queriesStore, analyticsStore } =
      useStore();

    let tokenInfo;
    let accessInfo: Secret20ViewingKeyPermissionInnerStore | undefined;

    if (contractAddress) {
      tokenInfo = queriesStore
        .get(chainStore.current.chainId)
        .secret.querySecret20ContractInfo.getQueryContract(contractAddress);

      accessInfo = permissionStore.getSecret20ViewingKeyAccessInfo(
        chainStore.current.chainId,
        contractAddress
      );
    }

    const xIcon = useMemo(
      () => [<i key="remove" className="fas fa-times" />],
      []
    );

    return (
      <HeaderLayout
        showTopMenu={true}
        smallTitle={true}
        showChainName={false}
        canChangeChainInfo={false}
        alternativeTitle={intl.formatMessage({
          id: "setting.connections.viewing-key",
        })}
        onBackButton={() => {
          analyticsStore.logEvent("back_click", { pageName: "Connections" });
          navigate(-1);
        }}
      >
        <div className={style["container"]}>
          <div
            className="text-gray"
            style={{
              padding: "8px 16px",
              fontSize: "14px",
            }}
          >{`${tokenInfo?.tokenInfo?.name} (${tokenInfo?.tokenInfo?.symbol})`}</div>
          {accessInfo?.origins.map((origin) => {
            return (
              <Card
                heading={origin}
                key={origin}
                onClick={async (e: any) => {
                  e.preventDefault();

                  if (
                    await confirm.confirm({
                      img: (
                        <img
                          alt="unlink"
                          src={require("@assets/img/broken-link.svg")}
                          style={{ height: "80px" }}
                        />
                      ),
                      title: intl.formatMessage({
                        id: "setting.connections.viewing-key.confirm.delete-connection.title",
                      }),
                      paragraph: intl.formatMessage({
                        id: "setting.connections.viewing-key.confirm.delete-connection.paragraph",
                      }),
                    })
                  ) {
                    await accessInfo?.removeOrigin(origin);
                  }
                }}
                rightContent={xIcon}
              />
            );
          })}
        </div>
      </HeaderLayout>
    );
  });
