import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { Button } from "reactstrap";

import { HeaderLayout } from "../../layouts";

import style from "./style.module.scss";

import { useStore } from "../../stores";

import classnames from "classnames";
import { DataTab } from "./data-tab";
import { DetailsTab } from "./details-tab";
import { FormattedMessage, useIntl } from "react-intl";

import { useHistory } from "react-router";
import { observer } from "mobx-react-lite";
import {
  useInteractionInfo,
  useSignDocHelper,
  useGasConfig,
  useFeeConfig,
  useMemoConfig,
  useSignDocAmountConfig,
} from "@keplr-wallet/hooks";
import { ADR36SignDocDetailsTab } from "./adr-36";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

enum Tab {
  Details,
  Data,
}

export const SignPage: FunctionComponent = observer(() => {
  const history = useHistory();

  const [tab, setTab] = useState<Tab>(Tab.Details);

  const intl = useIntl();

  const {
    chainStore,
    keyRingStore,
    signInteractionStore,
    accountStore,
    queriesStore,
  } = useStore();

  const [signer, setSigner] = useState("");
  const [origin, setOrigin] = useState<string | undefined>();
  const [isADR36WithString, setIsADR36WithString] = useState<
    boolean | undefined
  >();

  const current = chainStore.current;
  // Make the gas config with 1 gas initially to prevent the temporary 0 gas error at the beginning.
  const gasConfig = useGasConfig(chainStore, current.chainId, 1);
  const amountConfig = useSignDocAmountConfig(
    chainStore,
    current.chainId,
    accountStore.getAccount(current.chainId).msgOpts,
    signer
  );
  const feeConfig = useFeeConfig(
    chainStore,
    current.chainId,
    signer,
    queriesStore.get(current.chainId).queryBalances,
    amountConfig,
    gasConfig
  );
  const memoConfig = useMemoConfig(chainStore, current.chainId);

  const signDocHelper = useSignDocHelper(feeConfig, memoConfig);
  amountConfig.setSignDocHelper(signDocHelper);

  useEffect(() => {
    if (signInteractionStore.waitingData) {
      const data = signInteractionStore.waitingData;
      chainStore.selectChain(data.data.chainId);
      if (data.data.signDocWrapper.isADR36SignDoc) {
        setIsADR36WithString(data.data.isADR36WithString);
      }
      setOrigin(data.data.msgOrigin);
      if (
        !data.data.signDocWrapper.isADR36SignDoc &&
        data.data.chainId !== data.data.signDocWrapper.chainId
      ) {
        // Validate the requested chain id and the chain id in the sign doc are same.
        // If the sign doc is for ADR-36, there is no chain id in the sign doc, so no need to validate.
        throw new Error("Chain id unmatched");
      }
      signDocHelper.setSignDocWrapper(data.data.signDocWrapper);
      gasConfig.setGas(data.data.signDocWrapper.gas);
      memoConfig.setMemo(data.data.signDocWrapper.memo);
      if (
        data.data.signOptions.preferNoSetFee &&
        data.data.signDocWrapper.fees[0]
      ) {
        feeConfig.setManualFee(data.data.signDocWrapper.fees[0]);
      }
      amountConfig.setDisableBalanceCheck(
        !!data.data.signOptions.disableBalanceCheck
      );
      feeConfig.setDisableBalanceCheck(
        !!data.data.signOptions.disableBalanceCheck
      );
      setSigner(data.data.signer);
    }
  }, [
    amountConfig,
    chainStore,
    gasConfig,
    memoConfig,
    feeConfig,
    signDocHelper,
    signInteractionStore.waitingData,
  ]);

  // If the preferNoSetFee or preferNoSetMemo in sign options is true,
  // don't show the fee buttons/memo input by default
  // But, the sign options would be removed right after the users click the approve/reject button.
  // Thus, without this state, the fee buttons/memo input would be shown after clicking the approve buttion.
  const [isProcessing, setIsProcessing] = useState(false);
  const needSetIsProcessing =
    signInteractionStore.waitingData?.data.signOptions.preferNoSetFee ===
      true ||
    signInteractionStore.waitingData?.data.signOptions.preferNoSetMemo === true;

  const preferNoSetFee =
    signInteractionStore.waitingData?.data.signOptions.preferNoSetFee ===
      true || isProcessing;
  const preferNoSetMemo =
    signInteractionStore.waitingData?.data.signOptions.preferNoSetMemo ===
      true || isProcessing;

  const interactionInfo = useInteractionInfo(() => {
    if (needSetIsProcessing) {
      setIsProcessing(true);
    }

    signInteractionStore.rejectAll();
  });

  // Check that the request is delivered
  // and the chain is selected properly.
  // The chain store loads the saved chain infos including the suggested chain asynchronously on init.
  // So, it can be different the current chain and the expected selected chain for a moment.
  const isLoaded = useMemo(() => {
    if (!signDocHelper.signDocWrapper) {
      return false;
    }

    return (
      ChainIdHelper.parse(chainStore.current.chainId).identifier ===
      ChainIdHelper.parse(chainStore.selectedChainId).identifier
    );
  }, [chainStore, signDocHelper.signDocWrapper]);

  // If this is undefined, show the chain name on the header.
  // If not, show the alternative title.
  const alternativeTitle = (() => {
    if (!isLoaded) {
      return "";
    }

    if (
      signDocHelper.signDocWrapper &&
      signDocHelper.signDocWrapper.isADR36SignDoc
    ) {
      return "Prove Ownership";
    }

    return undefined;
  })();

  const approveIsDisabled = (() => {
    if (!isLoaded) {
      return true;
    }

    if (!signDocHelper.signDocWrapper) {
      return true;
    }

    // If the sign doc is for ADR-36,
    // there is no error related to the fee or memo...
    if (signDocHelper.signDocWrapper.isADR36SignDoc) {
      return false;
    }

    return memoConfig.getError() != null || feeConfig.getError() != null;
  })();

  return (
    <HeaderLayout
      showChainName={alternativeTitle == null}
      alternativeTitle={alternativeTitle != null ? alternativeTitle : undefined}
      canChangeChainInfo={false}
      onBackButton={
        interactionInfo.interactionInternal
          ? () => {
              history.goBack();
            }
          : undefined
      }
      style={{ background: "white" }}
    >
      {
        /*
         Show the informations of tx when the sign data is delivered.
         If sign data not delivered yet, show the spinner alternatively.
         */
        isLoaded ? (
          <div className={style.container}>
            <div className={classnames(style.tabs)}>
              <ul>
                <li className={classnames({ active: tab === Tab.Details })}>
                  <a
                    className={style.tab}
                    onClick={() => {
                      setTab(Tab.Details);
                    }}
                  >
                    {intl.formatMessage({
                      id: "sign.tab.details",
                    })}
                  </a>
                </li>
                <li className={classnames({ active: tab === Tab.Data })}>
                  <a
                    className={style.tab}
                    onClick={() => {
                      setTab(Tab.Data);
                    }}
                  >
                    {intl.formatMessage({
                      id: "sign.tab.data",
                    })}
                  </a>
                </li>
              </ul>
            </div>
            <div
              className={classnames(style.tabContainer, {
                [style.dataTab]: tab === Tab.Data,
              })}
            >
              {tab === Tab.Data ? (
                <DataTab signDocHelper={signDocHelper} />
              ) : null}
              {tab === Tab.Details ? (
                signDocHelper.signDocWrapper?.isADR36SignDoc ? (
                  <ADR36SignDocDetailsTab
                    signDocWrapper={signDocHelper.signDocWrapper}
                    isADR36WithString={isADR36WithString}
                    origin={origin}
                  />
                ) : (
                  <DetailsTab
                    signDocHelper={signDocHelper}
                    memoConfig={memoConfig}
                    feeConfig={feeConfig}
                    gasConfig={gasConfig}
                    isInternal={
                      interactionInfo.interaction &&
                      interactionInfo.interactionInternal
                    }
                    preferNoSetFee={preferNoSetFee}
                    preferNoSetMemo={preferNoSetMemo}
                  />
                )
              ) : null}
            </div>
            <div style={{ flex: 1 }} />
            <div className={style.buttons}>
              {keyRingStore.keyRingType === "ledger" &&
              signInteractionStore.isLoading ? (
                <Button
                  className={style.button}
                  color="primary"
                  disabled={true}
                  outline
                >
                  <FormattedMessage id="sign.button.confirm-ledger" />{" "}
                  <i className="fa fa-spinner fa-spin fa-fw" />
                </Button>
              ) : (
                <React.Fragment>
                  <Button
                    className={style.button}
                    color="danger"
                    disabled={signDocHelper.signDocWrapper == null}
                    data-loading={signInteractionStore.isLoading}
                    onClick={async (e) => {
                      e.preventDefault();

                      if (needSetIsProcessing) {
                        setIsProcessing(true);
                      }

                      await signInteractionStore.reject();

                      if (
                        interactionInfo.interaction &&
                        !interactionInfo.interactionInternal
                      ) {
                        window.close();
                      }
                    }}
                    outline
                  >
                    {intl.formatMessage({
                      id: "sign.button.reject",
                    })}
                  </Button>
                  <Button
                    className={style.button}
                    color="primary"
                    disabled={approveIsDisabled}
                    data-loading={signInteractionStore.isLoading}
                    onClick={async (e) => {
                      e.preventDefault();

                      if (needSetIsProcessing) {
                        setIsProcessing(true);
                      }

                      if (signDocHelper.signDocWrapper) {
                        await signInteractionStore.approveAndWaitEnd(
                          signDocHelper.signDocWrapper
                        );
                      }

                      if (
                        interactionInfo.interaction &&
                        !interactionInfo.interactionInternal
                      ) {
                        window.close();
                      }
                    }}
                  >
                    {intl.formatMessage({
                      id: "sign.button.approve",
                    })}
                  </Button>
                </React.Fragment>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <i className="fas fa-spinner fa-spin fa-2x text-gray" />
          </div>
        )
      }
    </HeaderLayout>
  );
});
