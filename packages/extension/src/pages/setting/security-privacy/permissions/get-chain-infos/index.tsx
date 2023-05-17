import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { HeaderLayout } from "../../../../../layouts";
import style from "../../../style.module.scss";
import { PageButton } from "../../../page-button";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";
import { useConfirm } from "@components/confirm";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import {
  GetGlobalPermissionOriginsMsg,
  RemoveGlobalPermissionOriginMsg,
} from "@keplr-wallet/background";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

export const SettingPermissionsGetChainInfosPage: FunctionComponent = () => {
  const [requester] = useState(() => new InExtensionMessageRequester());
  const [origins, setOrigins] = useState<string[]>([]);

  useEffect(() => {
    // TODO: Handle this in store (GeneralPermissionStore?)
    requester
      .sendMessage(
        BACKGROUND_PORT,
        new GetGlobalPermissionOriginsMsg("get-chain-infos")
      )
      .then((r) => setOrigins(r));
  }, [requester]);

  const history = useHistory();
  const intl = useIntl();

  const confirm = useConfirm();

  const xIcon = useMemo(
    () => [<i key="remove" className="fas fa-times" />],
    []
  );

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      smallTitle={true}
      alternativeTitle={intl.formatMessage({
        id: "setting.permissions.get-chain-infos",
      })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.container}>
        {origins.map((origin) => {
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
                        src={require("../../../../../public/assets/img/broken-link.svg")}
                        style={{ height: "80px" }}
                      />
                    ),
                    title: intl.formatMessage({
                      id: "setting.connections.confirm.delete-connection.title",
                    }),
                    paragraph: intl.formatMessage({
                      id:
                        "setting.connections.confirm.delete-connection.paragraph",
                    }),
                  })
                ) {
                  await requester.sendMessage(
                    BACKGROUND_PORT,
                    new RemoveGlobalPermissionOriginMsg(
                      "get-chain-infos",
                      origin
                    )
                  );

                  const origins = await requester.sendMessage(
                    BACKGROUND_PORT,
                    new GetGlobalPermissionOriginsMsg("get-chain-infos")
                  );
                  setOrigins(origins);
                }
              }}
              icons={xIcon}
            />
          );
        })}
      </div>
    </HeaderLayout>
  );
};
