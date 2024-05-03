/* eslint-disable import/no-extraneous-dependencies */
import { AxelarQueryAPI } from "@axelar-network/axelarjs-sdk";
import {
  BridgeAmountError,
  EmptyAmountError,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
  useSendTxConfig,
} from "@keplr-wallet/hooks";
import { extractNumberFromBalance } from "@utils/axl-bridge-utils";
import { observer } from "mobx-react-lite";
import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { CHAINS } from "../../../config.axl-brdige.var";
import { HeaderLayout } from "@layouts-v2/header-layout";
import { useStore } from "../../../stores";
import { ChainSelect } from "../chain-select";
import { GasAndDetails } from "../gas-and-details";
// import { RecipientAddress } from "../recipient-address";
import { Card } from "@components-v2/card";
import { Dropdown } from "@components-v2/dropdown";
import { CoinInput } from "@components-v2/form/coin-input";
import { ChainList } from "@layouts-v2/header/chain-list";
import style from "../style.module.scss";
import { TokenSelect } from "../token-select";
import { GetDepositAddress } from "./get-deposit-address";
import { SendToken } from "./send-token";

export const AxelarBridgeEVM = observer(() => {
  const { chainStore, queriesStore, accountStore } = useStore();
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
  const [_minDepositAmount, setMinDepositAmount] = useState<number>();
  // UI related state
  const [isChainsLoaded, setIsChainsLoaded] = useState(true);
  const [isFetchingAddress, setIsFetchingAddress] = useState<boolean>(false);
  const [isInactiveChain, setIsInactiveChain] = useState<boolean>(false);
  const [chainsDropdownOpen, setChainsDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const query = queriesStore
    .get(current.chainId)
    .queryBalances.getQueryBech32Address(accountInfo.bech32Address);

  const [toToken, setToToken] = useState<any>();

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

  return (
    <HeaderLayout
      showBottomMenu={true}
      showTopMenu={true}
      smallTitle={true}
      showChainName={false}
      alternativeTitle={"Axelar Bridge"}
      canChangeChainInfo={false}
      onBackButton={() => {
        navigate("/more");
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
      <div>
        <CoinInput
          amountConfig={configs.amountConfig}
          balanceText={intl.formatMessage({
            id: "send.input-button.balance",
          })}
        />

        <div />
        <Card
          style={{ background: "rgba(255,255,255,0.1)", marginBottom: "16px" }}
          onClick={() => setChainsDropdownOpen(true)}
          heading={"Transfer from"}
          subheading={current.chainName}
          rightContent={require("@assets/svg/wireframe/chevron-down.svg")}
        />
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
          setRecipientAddress={setRecipientAddress}
        />
        <hr style={{ background: "rgba(255, 255, 255, 0.2)" }} />
        <TokenSelect
          tokens={transferTokens}
          depositAddress={configs.recipientConfig.rawRecipient}
          recieverChain={recieverChain}
          transferToken={transferToken}
          setTransferToken={handleTokenSelect}
          setTokenBal={setTokenBal}
          tokenBal={tokenBal}
        />
      </div>

      {/* <RecipientAddress
        recieverChain={recieverChain}
        recipientAddress={recipientAddress}
        setRecipientAddress={setRecipientAddress}
        isDisabled={
          configs.recipientConfig.rawRecipient.length > 0 || !recieverChain
        }
        env={transferChain?.environment}
      /> */}
      <Card
        style={{
          height: "72px",
          background: "rgba(255,255,255,0.1)",
        }}
        heading={"Receive as"}
        subheading={toToken && toToken.assetSymbol}
        rightContent={require("@assets/svg/wireframe/chevron-down.svg")}
      />

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
      <Dropdown
        closeClicked={() => setChainsDropdownOpen(false)}
        isOpen={chainsDropdownOpen}
        setIsOpen={setChainsDropdownOpen}
        title="Select Chain"
        styleProp={{ height: "580px" }}
      >
        <ChainList />
      </Dropdown>
    </HeaderLayout>
  );
});
