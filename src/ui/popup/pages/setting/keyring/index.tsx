import React, { FunctionComponent, useCallback, useState } from "react";

import { HeaderLayout } from "../../../layouts/header-layout";

import { observer } from "mobx-react";
import { useStore } from "../../../stores";

import { useHistory } from "react-router";
import { Button, Popover, PopoverBody } from "reactstrap";

import style from "./style.module.scss";
import { useLoadingIndicator } from "../../../../components/loading-indicator";
import { PageButton } from "../page-button";
import { MultiKeyStoreInfoWithSelectedElem } from "../../../../../background/keyring/keyring";
import { FormattedMessage, useIntl } from "react-intl";

export const SetKeyRingPage: FunctionComponent = observer(() => {
  const intl = useIntl();

  const { keyRingStore } = useStore();
  const history = useHistory();

  const loadingIndicator = useLoadingIndicator();

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({ id: "setting.keyring" })}
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      <div className={style.container}>
        <div className={style.innerTopContainer}>
          <div style={{ flex: 1 }} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            <Button
              color="primary"
              size="sm"
              onClick={e => {
                e.preventDefault();

                browser.tabs.create({
                  url: "/popup.html#/register?mode=add"
                });
              }}
            >
              <i
                className="fas fa-plus"
                style={{ marginRight: "4px", fontSize: "8px" }}
              />
              <FormattedMessage id="setting.keyring.button.add" />
            </Button>
          </div>
        </div>
        {keyRingStore.multiKeyStoreInfo.map((keyStore, i) => {
          const bip44HDPath = keyStore.bip44HDPath
            ? keyStore.bip44HDPath
            : {
                account: 0,
                change: 0,
                addressIndex: 0
              };

          return (
            <PageButton
              key={i.toString()}
              title={`${
                keyStore.meta?.name
                  ? keyStore.meta.name
                  : intl.formatMessage({
                      id: "setting.keyring.unnamed-account"
                    })
              } ${
                keyStore.selected
                  ? intl.formatMessage({
                      id: "setting.keyring.selected-account"
                    })
                  : ""
              }`}
              paragraph={
                keyStore.type === "ledger"
                  ? `Ledger - m/44'/118'/${bip44HDPath.account}'`
                  : keyStore.meta?.email
                  ? keyStore.meta.email
                  : undefined
              }
              onClick={
                keyStore.selected
                  ? undefined
                  : async e => {
                      e.preventDefault();

                      loadingIndicator.setIsLoading("keyring", true);
                      try {
                        await keyRingStore.changeKeyRing(i);
                        await keyRingStore.save();
                        history.push("/");
                      } finally {
                        loadingIndicator.setIsLoading("keyring", false);
                      }
                    }
              }
              style={keyStore.selected ? { cursor: "default" } : undefined}
              icons={[
                <KeyRingToolsIcon key="tools" index={i} keyStore={keyStore} />
              ]}
            />
          );
        })}
      </div>
    </HeaderLayout>
  );
});

const KeyRingToolsIcon: FunctionComponent<{
  index: number;
  keyStore: MultiKeyStoreInfoWithSelectedElem;
}> = ({ index, keyStore }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleOpen = () => setIsOpen(isOpen => !isOpen);

  const history = useHistory();

  const [tooltipId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `tools-${Buffer.from(bytes).toString("hex")}`;
  });

  return (
    <React.Fragment>
      <Popover
        target={tooltipId}
        isOpen={isOpen}
        toggle={toggleOpen}
        placement="bottom"
      >
        <PopoverBody
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();

            history.push("");
          }}
        >
          {keyStore.type === "mnemonic" ? (
            <div
              style={{ cursor: "pointer" }}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();

                history.push(`/setting/export/${index}`);
              }}
            >
              <FormattedMessage id="setting.export" />
            </div>
          ) : null}
          <div
            style={{ cursor: "pointer" }}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();

              history.push(`/setting/clear/${index}`);
            }}
          >
            <FormattedMessage id="setting.clear" />
          </div>
        </PopoverBody>
      </Popover>
      <div
        id={tooltipId}
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          marginRight: "8px",
          cursor: "pointer"
        }}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();

          setIsOpen(true);
        }}
      >
        <i className="fas fa-ellipsis-h" />
      </div>
    </React.Fragment>
  );
};
