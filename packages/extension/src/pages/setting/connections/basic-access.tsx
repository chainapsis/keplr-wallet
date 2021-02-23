import React, { FunctionComponent, useMemo, useState } from "react";
import { HeaderLayout } from "../../../layouts";

import style from "../style.module.scss";
import { useHistory } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { PageButton } from "../page-button";
import {
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";

import styleConnections from "./style.module.scss";
import { useIntl } from "react-intl";
import { useConfirm } from "../../../components/confirm";

export const SettingConnectionsPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const intl = useIntl();

  const { chainStore, permissionStore } = useStore();
  const [selectedChainId, setSelectedChainId] = useState(
    chainStore.current.chainId
  );
  const basicAccessInfo = permissionStore.getBasicAccessInfo(selectedChainId);

  const [dropdownOpen, setOpen] = useState(false);
  const toggle = () => setOpen(!dropdownOpen);

  const confirm = useConfirm();

  const xIcon = useMemo(
    () => [<i key="remove" className="fas fa-times" />],
    []
  );

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.connections",
      })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.container}>
        <ButtonDropdown
          isOpen={dropdownOpen}
          toggle={toggle}
          className={styleConnections.dropdown}
        >
          <DropdownToggle caret style={{ boxShadow: "none" }}>
            {chainStore.getChain(selectedChainId).chainName}
          </DropdownToggle>
          <DropdownMenu>
            {chainStore.chainInfos.map((chainInfo) => {
              return (
                <DropdownItem
                  key={chainInfo.chainId}
                  onClick={(e) => {
                    e.preventDefault();

                    setSelectedChainId(chainInfo.chainId);
                  }}
                >
                  {chainInfo.chainName}
                </DropdownItem>
              );
            })}
          </DropdownMenu>
        </ButtonDropdown>
        {basicAccessInfo.origins.map((origin) => {
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
                      id: "setting.connections.confirm.delete-connection.title",
                    }),
                    paragraph: intl.formatMessage({
                      id:
                        "setting.connections.confirm.delete-connection.paragraph",
                    }),
                  })
                ) {
                  await basicAccessInfo.removeOrigin(origin);
                }
              }}
              icons={xIcon}
            />
          );
        })}
      </div>
    </HeaderLayout>
  );
});
