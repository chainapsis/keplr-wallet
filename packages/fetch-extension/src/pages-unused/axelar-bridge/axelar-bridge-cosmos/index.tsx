/* eslint-disable import/no-extraneous-dependencies */
import { AxelarQueryAPI } from "@axelar-network/axelarjs-sdk";
import { Input } from "@components/form";
import { HeaderLayout } from "@layouts/header-layout";
import { extractNumberFromBalance } from "@utils/axl-bridge-utils";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useStore } from "../../../stores";
import { ChainSelect } from "../chain-select";
import { GasAndDetails } from "../gas-and-details";
import { RecipientAddress } from "../recipient-address";
import style from "../style.module.scss";
import { TokenBalances } from "../token-balances";
import { TokenSelect } from "../token-select";
import { GetDepositAddress } from "./get-deposit-address";
import { SendToken } from "./send-token";
import { CHAINS } from "../../../config.axl-brdige.var";

export const AxelarBridgeCosmos = observer(() => {
  // to chain list
  const [recieverChain, setRecieverChain] = useState<any>();

  const [transferTokens, setTransferTokens] = useState<any[]>([]);
  const [transferToken, setTransferToken] = useState<any>();

  const [toToken, setToToken] = useState<any>();
  const [isInactiveChain, setIsInactiveChain] = useState<boolean>(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState<any>();
  const [amountError, setAmountError] = useState<any>();

  const [tokenBal, setTokenBal] = useState<any>("");
  const [relayerFee, setRelayerFee] = useState<string>("");

  // UI related state
  const [isChainsLoaded, setIsChainsLoaded] = useState(true);
  const [depositAddress, setDepositAddress] = useState<any>();
  const [isFetchingAddress, setIsFetchingAddress] = useState<boolean>(false);

  const { chainStore, analyticsStore } = useStore();
  const current = chainStore.current;
  const transferChain = CHAINS.find(
    (chain: any) => chain.chainId == current.chainId
  );

  const navigate = useNavigate();

  const handleAmountChange = (event: any) => {
    const amount = parseFloat(event.target.value);
    const minDepositAmt = extractNumberFromBalance(
      transferToken.minDepositAmt.toString()
    );
    const relayerFeeAmt = extractNumberFromBalance(relayerFee);
    const minAmount =
      minDepositAmt > relayerFeeAmt ? minDepositAmt : relayerFeeAmt;
    setAmount(amount);
    if (isNaN(amount)) {
      setAmountError("Please enter a valid number");
    } else if (amount < 0) {
      setAmountError("Amount cannot be less than zero");
    } else if (amount < minAmount) {
      setAmountError("Please enter at least the minimum deposit amount");
    } else if (amount > extractNumberFromBalance(tokenBal)) {
      setAmountError("Insufficient Balance");
    } else {
      setAmountError("");
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsChainsLoaded(false);
      try {
        if (transferChain) {
          setTransferTokens(transferChain.assets);

          const queryApi = new AxelarQueryAPI({
            environment: transferChain.environment,
          });
          const activeChains = await queryApi.getActiveChains();
          const isActiveChain = activeChains.find(
            (activeChain) =>
              activeChain.toLowerCase() == transferChain.id.toLowerCase()
          );
          if (!isActiveChain) {
            setIsInactiveChain(true);
            return;
          }
        }
      } catch (error) {
        console.error("Error loading assets:", error);
      } finally {
        setIsChainsLoaded(true);
      }
    };
    init();
  }, [transferChain]);
  useEffect(() => {
    if (transferToken && recieverChain) {
      const toToken: any = recieverChain?.assets.find(
        (asset: any) => asset.common_key === transferToken.common_key
      );
      setToToken(toToken);
    }
  }, [transferToken, recieverChain]);
  return (
    <HeaderLayout
      showChainName={false}
      alternativeTitle={"Axelar Bridge"}
      canChangeChainInfo={false}
      onBackButton={() => {
        analyticsStore.logEvent("back_click", { pageName: "Axelar Bridge" });
        navigate(-1);
      }}
    >
      {isFetchingAddress && (
        <div className={style["loader"]}>
          Generating Deposit address{" "}
          <i className="fas fa-spinner fa-spin ml-2" />
        </div>
      )}
      {isInactiveChain && (
        <div className={style["loader"]}>
          Axelar Bridge currently not active for {current.chainName}. Please try
          later
        </div>
      )}
      <div className={style["chain-container"]}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div className={style["label"]}>Current Chain</div>
          <Input
            style={{ width: "150px", height: "43px", textAlign: "center" }}
            value={current.chainName}
            readOnly={true}
          />
        </div>
        <ChainSelect
          chains={
            transferChain
              ? CHAINS.filter(
                  (chain) => chain.environment == transferChain.environment
                )
              : []
          }
          recieverChain={recieverChain}
          setRecieverChain={setRecieverChain}
          isChainsLoaded={isChainsLoaded}
          depositAddress={depositAddress}
        />
      </div>

      <RecipientAddress
        recieverChain={recieverChain}
        recipientAddress={recipientAddress}
        setRecipientAddress={setRecipientAddress}
        isDisabled={!recieverChain || depositAddress}
        env={transferChain?.environment}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <TokenSelect
          tokens={transferTokens}
          recieverChain={recieverChain}
          depositAddress={depositAddress}
          setTransferToken={setTransferToken}
          transferToken={transferToken}
        />
        <div>
          <div className={style["label"]}>Receive Token</div>
          <Input
            readOnly={true}
            contentEditable={false}
            value={toToken ? toToken.assetSymbol : "Select a Token"}
            style={{ width: "150px", height: "43px", textAlign: "center" }}
          />
        </div>
      </div>
      {transferToken && (
        <TokenBalances
          fromToken={transferToken}
          tokenBal={tokenBal}
          setTokenBal={setTokenBal}
          relayerFee={relayerFee}
        />
      )}
      <Input
        type="number"
        min="0"
        label={"Enter Amount"}
        onChange={handleAmountChange}
        disabled={!transferToken || depositAddress}
      />

      {amountError ? (
        <div className={style["errorText"]}>{amountError}</div>
      ) : null}

      {transferToken && (
        <GasAndDetails
          transferChain={transferChain}
          recieverChain={recieverChain}
          transferToken={transferToken}
          depositAddress={depositAddress}
          estimatedWaitTime={transferChain?.estimatedWaitTime}
          relayerFee={relayerFee}
          setRelayerFee={setRelayerFee}
        />
      )}

      {depositAddress ? (
        <SendToken
          transferChain={transferChain}
          recieverChain={recieverChain}
          destinationAddress={recipientAddress}
          depositAddress={depositAddress}
          amount={amount}
          transferToken={transferToken}
        />
      ) : (
        <GetDepositAddress
          fromChain={transferChain}
          toChain={recieverChain}
          recipentAddress={recipientAddress}
          setDepositAddress={setDepositAddress}
          setIsFetchingAddress={setIsFetchingAddress}
          transferToken={transferToken}
          amountError={amountError}
        />
      )}
    </HeaderLayout>
  );
});
