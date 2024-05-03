/* eslint-disable import/no-extraneous-dependencies */
import { AxelarQueryAPI } from "@axelar-network/axelarjs-sdk";
import { Input } from "@components/form";
import {
  BridgeAmountError,
  EmptyAmountError,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
  useSendTxConfig,
} from "@keplr-wallet/hooks";
import { HeaderLayout } from "@layouts/header-layout";
import {
  extractNumberFromBalance,
  shortenBalance,
} from "@utils/axl-bridge-utils";
import { observer } from "mobx-react-lite";
import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { CHAINS } from "../../../config.axl-brdige.var";
import { useStore } from "../../../stores";
import { ChainSelect } from "../chain-select";
import { GasAndDetails } from "../gas-and-details";
import { RecipientAddress } from "../recipient-address";
import style from "../style.module.scss";
import { TokenSelect } from "../token-select";
import { GetDepositAddress } from "./get-deposit-address";
import { SendToken } from "./send-token";

export const AxelarBridgeEVM = observer(() => {
  const { chainStore, queriesStore, accountStore, analyticsStore } = useStore();
  const current = chainStore.current;
  const transferChain = CHAINS.find(
    (chain: any) => chain.chainId == current.chainId
  );
  const accountInfo = accountStore.getAccount(current.chainId);
  const configs = useSendTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    current.chainId,
    accountInfo.bech32Address,
    {
      allowHexAddressOnEthermint: true,
      computeTerraClassicTax: true,
    }
  );

  const intl = useIntl();
  const error = configs.amountConfig.error;
  const errorText: string | undefined = useMemo(() => {
    if (error) {
      switch (error.constructor) {
        case EmptyAmountError:
          // No need to show the error to user.
          return;
        case InvalidNumberAmountError:
          return intl.formatMessage({
            id: "input.amount.error.invalid-number",
          });
        case ZeroAmountError:
          return intl.formatMessage({
            id: "input.amount.error.is-zero",
          });
        case NegativeAmountError:
          return intl.formatMessage({
            id: "input.amount.error.is-negative",
          });
        case InsufficientAmountError:
          return intl.formatMessage({
            id: "input.amount.error.insufficient",
          });
        case BridgeAmountError:
          return error.message;
        default:
          return intl.formatMessage({ id: "input.amount.error.unknown" });
      }
    }
  }, [intl, error]);

  configs.memoConfig.setMemo("");
  configs.feeConfig.setFeeType("high");

  // to chain list
  const [recieverChain, setRecieverChain] = useState<any>();
  const [transferTokens, setTransferTokens] = useState<any[]>([]);
  const [transferToken, setTransferToken] = useState<any>();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [relayerFee, setRelayerFee] = useState<string>("");
  const [minDepositAmount, setMinDepositAmount] = useState<number>();
  // UI related state
  const [isChainsLoaded, setIsChainsLoaded] = useState(true);
  const [isFetchingAddress, setIsFetchingAddress] = useState<boolean>(false);
  const [isInactiveChain, setIsInactiveChain] = useState<boolean>(false);
  const navigate = useNavigate();

  const query = queriesStore
    .get(current.chainId)
    .queryBalances.getQueryBech32Address(accountInfo.bech32Address);

  const [toToken, setToToken] = useState<any>();
  const [amountError, setAmountError] = useState<any>();
  const [tokenBal, setTokenBal] = useState<any>("");

  useEffect(() => {
    if (transferToken) {
      const { balances, nonNativeBalances } = query;
      const queryBalances = balances.concat(nonNativeBalances);
      const queryBalance = queryBalances.find(
        (bal) =>
          transferToken.assetSymbol == bal.currency.coinDenom ||
          transferToken.ibcDenom == bal.currency.coinMinimalDenom
      );
      if (queryBalance?.balance)
        setTokenBal(queryBalance.balance.trim(true).maxDecimals(6).toString());
    } else {
      setTokenBal(null);
    }
  }, [transferToken]);

  useEffect(() => {
    if (transferToken) {
      const minDepositAmt = extractNumberFromBalance(
        transferToken.minDepositAmt.toString()
      );
      const relayerFeeAmt = extractNumberFromBalance(relayerFee);
      const minAmount =
        minDepositAmt > relayerFeeAmt ? minDepositAmt : relayerFeeAmt;
      setMinDepositAmount(minAmount);
    }
  }, [relayerFee, transferToken]);

  useEffect(() => {
    if (transferToken && recieverChain) {
      const toToken: any = recieverChain?.assets.find(
        (asset: any) => asset.common_key === transferToken.common_key
      );
      setToToken(toToken);
    }
  }, [transferToken, recieverChain]);

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

  const handleTokenSelect = (token: any) => {
    const tokenCurrency = current.currencies.find(
      (currency: any) =>
        currency.contractAddress == token.tokenAddress ||
        currency.coinMinimalDenom === token.ibcDenom
    );
    configs.amountConfig.setSendCurrency(tokenCurrency);
    setTransferToken(token);
  };

  const handleAmountChange = (event: any) => {
    const minDepositAmt = extractNumberFromBalance(
      transferToken.minDepositAmt.toString()
    );
    const relayerFeeAmt = extractNumberFromBalance(relayerFee);
    const minAmount =
      minDepositAmt > relayerFeeAmt ? minDepositAmt : relayerFeeAmt;
    setMinDepositAmount(minAmount);
    configs.amountConfig.setAmount(event.target.value);
    const value = parseFloat(event.target.value);
    if (value < minAmount) {
      setAmountError("Please enter at least the minimum amount");
    } else if (value > extractNumberFromBalance(tokenBal)) {
      setAmountError("Insufficient Balance");
    } else {
      setAmountError(null);
    }
  };
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
          Axelar Bridge not active for {current.chainName}
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
          depositAddress={configs.recipientConfig.rawRecipient}
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
        />
      </div>

      <RecipientAddress
        recieverChain={recieverChain}
        recipientAddress={recipientAddress}
        setRecipientAddress={setRecipientAddress}
        isDisabled={
          configs.recipientConfig.rawRecipient.length > 0 || !recieverChain
        }
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
          depositAddress={configs.recipientConfig.rawRecipient}
          recieverChain={recieverChain}
          transferToken={transferToken}
          setTransferToken={handleTokenSelect}
        />
        <div>
          <div className={style["label"]}>Receive Token</div>
          <Input
            readOnly={true}
            disabled={configs.recipientConfig.rawRecipient.length > 0}
            contentEditable={false}
            value={toToken ? toToken.assetSymbol : "N/A"}
            style={{ width: "150px", height: "43px", textAlign: "center" }}
          />
        </div>
      </div>
      {transferToken && (
        <div
          style={{ float: "right", fontSize: "small" }}
          className={style["label"]}
        >
          Min Amount :{`${minDepositAmount} ${transferToken.assetSymbol}`}
          <div>Balance : {tokenBal ? shortenBalance(tokenBal) : "0.0"}</div>
        </div>
      )}
      <Input
        type="number"
        min="0"
        placeholder="Enter Amount"
        onChange={handleAmountChange}
        disabled={
          !transferToken || configs.recipientConfig.rawRecipient.length > 0
        }
      />

      {amountError ? (
        <div className={style["errorText"]}>{errorText || amountError}</div>
      ) : null}
      {transferChain && transferToken && (
        <GasAndDetails
          transferChain={transferChain}
          recieverChain={recieverChain}
          transferToken={transferToken}
          depositAddress={configs.recipientConfig.rawRecipient}
          estimatedWaitTime={transferChain.estimatedWaitTime}
          relayerFee={relayerFee}
          setRelayerFee={setRelayerFee}
        />
      )}

      {configs.recipientConfig.rawRecipient ? (
        <SendToken sendConfigs={configs} />
      ) : (
        <GetDepositAddress
          recipientConfig={configs.recipientConfig}
          fromChain={transferChain}
          toChain={recieverChain}
          recipentAddress={recipientAddress}
          setIsFetchingAddress={setIsFetchingAddress}
          transferToken={transferToken}
          isDisabled={
            !!errorText ||
            !recipientAddress ||
            configs.amountConfig.sendCurrency === undefined
          }
        />
      )}
    </HeaderLayout>
  );
});
