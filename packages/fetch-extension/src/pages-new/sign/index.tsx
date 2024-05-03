import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { Button } from "reactstrap";

import style from "./style.module.scss";

import { useStore } from "../../stores";

import { DataTab } from "./data-tab";
import { DetailsTab } from "./details-tab";
import { FormattedMessage } from "react-intl";

import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import {
  useFeeConfig,
  useInteractionInfo,
  useMemoConfig,
  useSignDocAmountConfig,
  useSignDocHelper,
  useZeroAllowedGasConfig,
} from "@keplr-wallet/hooks";
import { ADR36SignDocDetailsTab } from "./adr-36";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { unescapeHTML } from "@keplr-wallet/common";
import { EthSignType } from "@keplr-wallet/types";
import { Dropdown } from "@components-v2/dropdown";
import { TabsPanel } from "@components-v2/tabs/tabsPanel-2";
import { ButtonV2 } from "@components-v2/buttons/button";

export const SignPageV2: FunctionComponent = observer(() => {
  const navigate = useNavigate();

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
  const [ethSignType, setEthSignType] = useState<EthSignType | undefined>();

  const current = chainStore.current;
  // There are services that sometimes use invalid tx to sign arbitrary data on the sign page.
  // In this case, there is no obligation to deal with it, but 0 gas is favorably allowed.
  const gasConfig = useZeroAllowedGasConfig(chainStore, current.chainId, 0);
  const amountConfig = useSignDocAmountConfig(
    chainStore,
    accountStore,
    current.chainId,
    signer
  );
  const feeConfig = useFeeConfig(
    chainStore,
    queriesStore,
    current.chainId,
    signer,
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
      if (data.data.ethSignType) {
        setEthSignType(data.data.ethSignType);
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
      let memo = data.data.signDocWrapper.memo;
      if (data.data.signDocWrapper.mode === "amino") {
        // For amino-json sign doc, the memo is escaped by default behavior of golang's json marshaller.
        // For normal users, show the escaped characters with unescaped form.
        // Make sure that the actual sign doc's memo should be escaped.
        // In this logic, memo should be escaped from account store or background's request signing function.
        memo = unescapeHTML(memo);
      }
      memoConfig.setMemo(memo);
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
      if (
        data.data.signDocWrapper.granter &&
        data.data.signDocWrapper.granter !== data.data.signer
      ) {
        feeConfig.setDisableBalanceCheck(true);
      }
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

  const interactionInfo = useInteractionInfo(
    () => {
      if (needSetIsProcessing) {
        setIsProcessing(true);
      }

      signInteractionStore.rejectAll();
    },
    {
      enableScroll: true,
    }
  );

  const currentChainId = chainStore.current.chainId;
  const currentChainIdentifier = useMemo(
    () => ChainIdHelper.parse(currentChainId).identifier,
    [currentChainId]
  );
  const selectedChainId = chainStore.selectedChainId;
  const selectedChainIdentifier = useMemo(
    () => ChainIdHelper.parse(selectedChainId).identifier,
    [selectedChainId]
  );

  // Check that the request is delivered
  // and the chain is selected properly.
  // The chain store loads the saved chain infos including the suggested chain asynchronously on init.
  // So, it can be different the current chain and the expected selected chain for a moment.
  const isLoaded = (() => {
    if (!signDocHelper.signDocWrapper) {
      return false;
    }

    return currentChainIdentifier === selectedChainIdentifier;
  })();

  // If this is undefined, show the chain name on the header.
  // If not, show the alternative title.

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

    return memoConfig.error != null || feeConfig.error != null;
  })();
  const [isOpen, setIsOpen] = useState(true);
  const isADR36SignDoc =
    signDocHelper.signDocWrapper && signDocHelper.signDocWrapper.isADR36SignDoc;
  const tabs = [
    {
      id: "Details",
      component: isADR36SignDoc ? (
        <ADR36SignDocDetailsTab
          signDocWrapper={signDocHelper.signDocWrapper}
          isADR36WithString={isADR36WithString}
          ethSignType={ethSignType}
          origin={origin}
        />
      ) : (
        <DetailsTab
          signDocHelper={signDocHelper}
          memoConfig={memoConfig}
          feeConfig={feeConfig}
          gasConfig={gasConfig}
          isInternal={
            interactionInfo.interaction && interactionInfo.interactionInternal
          }
          preferNoSetFee={preferNoSetFee}
          preferNoSetMemo={preferNoSetMemo}
          isNeedLedgerEthBlindSigning={
            ethSignType === EthSignType.EIP712 &&
            accountStore.getAccount(current.chainId).isNanoLedger
          }
        />
      ),
    },
    {
      id: "Data",
      component: (
        <DataTab signDocHelper={signDocHelper} ethSignType={ethSignType} />
      ),
    },
  ];
  return (
    <div>
      {
        /*
         Show the informations of tx when the sign data is delivered.
         If sign data not delivered yet, show the spinner alternatively.
         */
        isLoaded ? (
          <div>
            <Dropdown
              styleProp={{ height: "579px" }}
              title={"Confirm transaction"}
              closeClicked={() => {
                navigate(-1);
              }}
              setIsOpen={setIsOpen}
              isOpen={isOpen}
            >
              <div style={{ marginBottom: "50px" }}>
                <TabsPanel tabs={tabs} />
              </div>
              <div className={style["buttons"]}>
                {keyRingStore.keyRingType === "ledger" &&
                signInteractionStore.isLoading ? (
                  <Button
                    className={style["button"]}
                    color="primary"
                    disabled={true}
                    outline
                  >
                    <FormattedMessage id="sign.button.confirm-ledger" />{" "}
                    <i className="fa fa-spinner fa-spin fa-fw" />
                  </Button>
                ) : (
                  <React.Fragment>
                    <ButtonV2
                      styleProps={{
                        position: "fixed",
                        bottom: "12px",
                        width: "94%",
                      }}
                      disabled={
                        approveIsDisabled || signInteractionStore.isLoading
                      }
                      text={
                        signInteractionStore.isLoading ? (
                          <i className="fas fa-spinner fa-spin ml-2" />
                        ) : (
                          "Approve transaction"
                        )
                      }
                      data-loading={signInteractionStore.isLoading}
                      onClick={async (e: any) => {
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
                    />
                  </React.Fragment>
                )}
              </div>
            </Dropdown>
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
    </div>
  );
});
