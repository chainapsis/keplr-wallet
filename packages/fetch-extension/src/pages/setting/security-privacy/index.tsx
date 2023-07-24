import React, { FunctionComponent, useMemo } from "react";
import { HeaderLayout } from "../../../layouts";
import style from "../style.module.scss";
import { PageButton } from "../page-button";
import { useNavigate } from "react-router";
import { useIntl } from "react-intl";

export const SettingSecurityPrivacyPage: FunctionComponent = () => {
  const navigate = useNavigate();

  const intl = useIntl();

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.security-privacy",
      })}
      onBackButton={() => {
        navigate(-1);
      }}
    >
      <div className={style["container"]}>
        <PageButton
          title={intl.formatMessage({
            id: "setting.connections",
          })}
          paragraph={intl.formatMessage({
            id: "setting.connections.paragraph",
          })}
          onClick={() => {
            navigate("/setting/connections");
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.permissions.get-chain-infos",
          })}
          paragraph={intl.formatMessage({
            id: "setting.permissions.get-chain-infos.paragraph",
          })}
          onClick={() => {
            navigate("/setting/permissions/get-chain-infos");
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.autolock",
          })}
          onClick={() => {
            navigate("/setting/autolock");
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
      </div>
    </HeaderLayout>
  );
};
