import React, { FunctionComponent, useMemo } from "react";
import { useHistory, useRouteMatch } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import style from "../style.module.scss";
import { PageButton } from "../page-button";
import { HeaderLayout } from "../../../layouts";
import { useIntl } from "react-intl";
import { useConfirm } from "../../../components/confirm";

export const SettingSecret20ViewingKeyConnectionsPage: FunctionComponent = observer(
  () => {
    const match = useRouteMatch<{
      contractAddress: string;
    }>();

    const intl = useIntl();
    const history = useHistory();
    const confirm = useConfirm();

    const { chainStore, permissionStore, queriesStore } = useStore();

    const tokenInfo = queriesStore
      .get(chainStore.current.chainId)
      .secret.querySecret20ContractInfo.getQueryContract(
        match.params.contractAddress
      );

    const accessInfo = permissionStore.getSecret20ViewingKeyAccessInfo(
      chainStore.current.chainId,
      match.params.contractAddress
    );

    const xIcon = useMemo(
      () => [<i key="remove" className="fas fa-times" />],
      []
    );

    return (
      <HeaderLayout
        showChainName={false}
        canChangeChainInfo={false}
        alternativeTitle={intl.formatMessage({
          id: "setting.connections.viewing-key",
        })}
        onBackButton={() => {
          history.goBack();
        }}
      >
        <div className={style.container}>
          <div
            className="text-gray"
            style={{
              padding: "8px 16px",
              fontSize: "14px",
            }}
          >{`${tokenInfo.tokenInfo?.name} (${tokenInfo.tokenInfo?.symbol})`}</div>
          {accessInfo.origins.map((origin) => {
            return (
              <PageButton
                title={origin}
                key={origin}
                onClick={async (e) => {
                  e.preventDefault();

                  if (
                    await confirm.confirm({
                      img: (
                        <img
                          alt="unlink"
                          src={require("../../../public/assets/img/broken-link.svg")}
                          style={{ height: "80px" }}
                        />
                      ),
                      title: intl.formatMessage({
                        id:
                          "setting.connections.viewing-key.confirm.delete-connection.title",
                      }),
                      paragraph: intl.formatMessage({
                        id:
                          "setting.connections.viewing-key.confirm.delete-connection.paragraph",
                      }),
                    })
                  ) {
                    await accessInfo.removeOrigin(origin);
                  }
                }}
                icons={xIcon}
              />
            );
          })}
        </div>
      </HeaderLayout>
    );
  }
);
