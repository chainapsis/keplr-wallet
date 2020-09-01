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

export const SetKeyRingPage: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const history = useHistory();

  const loadingIndicator = useLoadingIndicator();

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle="Set Account"
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
              Add
            </Button>
          </div>
        </div>
        {keyRingStore.multiKeyStoreInfo.map((keyStore, i) => {
          return (
            <PageButton
              key={i.toString()}
              title={keyStore.meta?.name ? keyStore.meta.name : "Unnamed"}
              onClick={async e => {
                e.preventDefault();

                loadingIndicator.setIsLoading("keyring", true);
                try {
                  await keyRingStore.changeKeyRing(i);
                  await keyRingStore.save();
                  history.push("/");
                } finally {
                  loadingIndicator.setIsLoading("keyring", false);
                }
              }}
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
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();

                history.push(`/setting/export/${index}`);
              }}
            >
              View mnemonic
            </div>
          ) : null}
          <div
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();

              history.push(`/setting/clear/${index}`);
            }}
          >
            Delete
          </div>
        </PopoverBody>
      </Popover>
      <i
        id={tooltipId}
        className="fas fa-ellipsis-h"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();

          setIsOpen(true);
        }}
      />
    </React.Fragment>
  );
};
