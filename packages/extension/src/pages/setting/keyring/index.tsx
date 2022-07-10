import React, { FunctionComponent, useState } from "react";

import { HeaderLayout } from "../../../layouts";

import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";

import { useNavigate } from "react-router";
import { Button, Popover, PopoverBody } from "reactstrap";

import style from "./style.module.scss";
import { useLoadingIndicator } from "../../../components/loading-indicator";
import { PageButton } from "../page-button";
import { MultiKeyStoreInfoWithSelectedElem } from "@keplr-wallet/background";
import { FormattedMessage, useIntl } from "react-intl";

export interface KeyRingPageProps {
  pickAddressOnly?: boolean;
  pickAddressAction?: (address: string) => void;
  closeKeyRingPage?: () => void;
  onBackButtonAction?: () => void;
}

export const SetKeyRingPage: FunctionComponent<KeyRingPageProps> = observer(
  ({
    pickAddressOnly = false,
    pickAddressAction,
    closeKeyRingPage,
    onBackButtonAction,
  }) => {
    const intl = useIntl();

    const onBackButtonHandler = () => {
      if (onBackButtonAction) {
        onBackButtonAction();
      } else {
        navigate(-1);
      }
    };

    const {
      keyRingStore,
      accountStore,
      chainStore,
      analyticsStore,
    } = useStore();
    const navigate = useNavigate();

    const loadingIndicator = useLoadingIndicator();

    const pickAddressActionHandler = (address: string) => {
      if (pickAddressAction) {
        pickAddressAction(address);
      }
    };

    const closeKeyRingPageHandler = () => {
      if (closeKeyRingPage) {
        closeKeyRingPage();
      }
    };

    return (
      <HeaderLayout
        showChainName={false}
        canChangeChainInfo={false}
        alternativeTitle={intl.formatMessage({ id: "setting.keyring" })}
        onBackButton={() => {
          onBackButtonHandler();
        }}
      >
        <div className={style.container}>
          <div className={style.innerTopContainer}>
            <div style={{ flex: 1 }} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Button
                color="primary"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  analyticsStore.logEvent("Add additional account started");

                  browser.tabs.create({
                    url: "/popup.html#/register",
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
                  addressIndex: 0,
                };

            return (
              <PageButton
                key={i.toString()}
                title={`${
                  keyStore.meta?.name
                    ? keyStore.meta.name
                    : intl.formatMessage({
                        id: "setting.keyring.unnamed-account",
                      })
                } ${
                  keyStore.selected
                    ? pickAddressOnly
                      ? ""
                      : intl.formatMessage({
                          id: "setting.keyring.selected-account",
                        })
                    : ""
                }`}
                paragraph={
                  keyStore.type === "ledger"
                    ? `Ledger - m/44'/118'/${bip44HDPath.account}'${
                        bip44HDPath.change !== 0 ||
                        bip44HDPath.addressIndex !== 0
                          ? `/${bip44HDPath.change}/${bip44HDPath.addressIndex}`
                          : ""
                      }`
                    : keyStore.meta?.email
                    ? keyStore.meta.email
                    : undefined
                }
                onClick={
                  pickAddressOnly
                    ? async () => {
                        const oldKeyIndex = keyRingStore.currentIndex;
                        await keyRingStore.changeKeyRing(i);
                        pickAddressActionHandler(
                          accountStore.getAccount(chainStore.current.chainId)
                            .bech32Address
                        );
                        closeKeyRingPageHandler();
                        keyRingStore.changeKeyRing(oldKeyIndex);
                      }
                    : keyStore.selected
                    ? undefined
                    : async (e) => {
                        e.preventDefault();
                        loadingIndicator.setIsLoading("keyring", true);
                        try {
                          await keyRingStore.changeKeyRing(i);
                          analyticsStore.logEvent("Account changed");
                          loadingIndicator.setIsLoading("keyring", false);
                          navigate("/");
                        } catch (e: any) {
                          console.log(`Failed to change keyring: ${e.message}`);
                          loadingIndicator.setIsLoading("keyring", false);
                        }
                      }
                }
                style={keyStore.selected ? { cursor: "default" } : undefined}
                icons={
                  pickAddressOnly
                    ? [<div key="tempplaceholder" />]
                    : [
                        <KeyRingToolsIcon
                          key="tools"
                          index={i}
                          keyStore={keyStore}
                        />,
                      ]
                }
              />
            );
          })}
        </div>
      </HeaderLayout>
    );
  }
);

const KeyRingToolsIcon: FunctionComponent<{
  index: number;
  keyStore: MultiKeyStoreInfoWithSelectedElem;
}> = ({ index, keyStore }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleOpen = () => setIsOpen((isOpen) => !isOpen);

  const navigate = useNavigate();

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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            navigate("");
          }}
        >
          {keyStore.type === "mnemonic" || keyStore.type === "privateKey" ? (
            <div
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                navigate(`/setting/export/${index}?type=${keyStore.type}`);
              }}
            >
              <FormattedMessage
                id={
                  keyStore.type === "mnemonic"
                    ? "setting.export"
                    : "setting.export.private-key"
                }
              />
            </div>
          ) : null}
          <div
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              navigate(`/setting/keyring/change/name/${index}`);
            }}
          >
            <FormattedMessage id="setting.keyring.change.name" />
          </div>
          <div
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              navigate(`/setting/clear/${index}`);
            }}
          >
            <FormattedMessage id="setting.clear" />
          </div>
        </PopoverBody>
      </Popover>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          padding: "0 8px",
          cursor: "pointer",
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          setIsOpen(true);
        }}
      >
        <i id={tooltipId} className="fas fa-ellipsis-h" />
      </div>
    </React.Fragment>
  );
};
