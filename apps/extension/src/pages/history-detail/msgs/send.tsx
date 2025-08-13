import React, { FunctionComponent, useMemo } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { ColorPalette } from "../../../styles";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Subtitle3, Subtitle4 } from "../../../components/typography";
import { Gutter } from "../../../components/gutter";
import { MsgHistory } from "../../main/token-detail/types";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Tooltip } from "../../../components/tooltip";

export const HistoryDetailSend: FunctionComponent<{
  msg: MsgHistory;
  targetDenom: string;
}> = observer(({ msg, targetDenom }) => {
  const { chainStore, accountStore } = useStore();

  const chainInfo = chainStore.getChain(msg.chainId);
  const account = accountStore.getAccount(msg.chainId);

  const sendAmountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(targetDenom);

    const amounts = (msg.msg as any)["amount"] as {
      denom: string;
      amount: string;
    }[];

    const amt = amounts.find((amt) => amt.denom === targetDenom);
    if (!amt) {
      return new CoinPretty(currency, "0");
    }
    return new CoinPretty(currency, amt.amount);
  }, [chainInfo, msg.msg, targetDenom]);

  const fromAddress = (() => {
    return (msg.msg as any)["from_address"];
  })();

  const name = (() => {
    if (account.bech32Address === fromAddress) {
      return account.name;
    }
    return "";
  })();

  const shortenedFromAddress = useMemo(() => {
    try {
      return Bech32Address.shortenAddress(fromAddress, 18);
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  }, [fromAddress]);

  const toAddress = (() => {
    return (msg.msg as any)["to_address"];
  })();

  const shortenedToAddress = useMemo(() => {
    try {
      return Bech32Address.shortenAddress(toAddress, 18);
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  }, [toAddress]);

  return (
    <HistoryDetailSendBaseUI
      fromAddress={fromAddress}
      shortenedFromAddress={shortenedFromAddress}
      toAddress={toAddress}
      shortenedToAddress={shortenedToAddress}
      fromTextWalletIcon={true}
      fromText={name}
      fromAmount={sendAmountPretty}
    />
  );
});

export const HistoryDetailSendBaseUI: FunctionComponent<{
  fromAddress: string;
  shortenedFromAddress: string;
  toAddress: string;
  shortenedToAddress: string;

  fromTextWalletIcon?: boolean;
  fromText?: string;
  toTextWalletIcon?: boolean;
  toText?: string;

  fromAmount?: CoinPretty;
  toAmount?: CoinPretty;
}> = ({
  fromAddress,
  shortenedFromAddress,
  toAddress,
  shortenedToAddress,
  fromTextWalletIcon,
  fromText,
  toTextWalletIcon,
  toText,
  fromAmount,
  toAmount,
}) => {
  return (
    <Box>
      <YAxis alignX="center">
        <HistoryDetailSendBaseUIUpper
          fromAddress={fromAddress}
          shortenedFromAddress={shortenedFromAddress}
          fromTextWalletIcon={fromTextWalletIcon}
          fromText={fromText}
          fromAmount={fromAmount}
        />

        <Gutter size="0.5rem" />
        <ArrowDownIcon size="1.25rem" color={ColorPalette["gray-300"]} />
        <Gutter size="0.5rem" />

        <HistoryDetailSendBaseUILower
          toAddress={toAddress}
          shortenedToAddress={shortenedToAddress}
          toTextWalletIcon={toTextWalletIcon}
          toText={toText}
          toAmount={toAmount}
        />
      </YAxis>
    </Box>
  );
};

export const HistoryDetailSendBaseUIUpper: FunctionComponent<{
  fromAddress: string;
  shortenedFromAddress: string;

  fromTextWalletIcon?: boolean;
  fromText?: string;

  fromAmount?: CoinPretty;
}> = ({
  fromAddress,
  shortenedFromAddress,
  fromTextWalletIcon,
  fromText,
  fromAmount,
}) => {
  return (
    <Box
      width="100%"
      padding="1rem"
      borderRadius="0.375rem"
      backgroundColor={ColorPalette["gray-650"]}
    >
      <XAxis alignY="center">
        <Box minWidth="2rem">
          <Subtitle4 color={ColorPalette["gray-200"]}>From</Subtitle4>
        </Box>
        <Gutter size="0.5rem" />
        <YAxis>
          <Tooltip content={fromAddress} allowedPlacements={["top", "right"]}>
            <Box
              backgroundColor={ColorPalette["gray-550"]}
              borderRadius="999px"
              paddingX="0.5rem"
              paddingY="0.25rem"
            >
              <Subtitle3 color={ColorPalette["white"]}>
                {shortenedFromAddress}
              </Subtitle3>
            </Box>
          </Tooltip>
          {fromText ? (
            <React.Fragment>
              <Gutter size="0.25rem" />
              <XAxis alignY="center">
                {fromTextWalletIcon ? (
                  <React.Fragment>
                    <ManIcon size="0.875rem" color={ColorPalette["gray-400"]} />
                    <Gutter size="0.25rem" />
                  </React.Fragment>
                ) : null}
                <Subtitle4 color={ColorPalette["gray-300"]}>
                  {fromText}
                </Subtitle4>
              </XAxis>
            </React.Fragment>
          ) : null}
        </YAxis>
        {fromAmount ? (
          <React.Fragment>
            <div style={{ flex: 1 }} />
            <Subtitle3 color={ColorPalette["gray-50"]}>{`- ${fromAmount
              .maxDecimals(3)
              .shrink(true)
              .hideIBCMetadata(true)
              .inequalitySymbol(true)
              .inequalitySymbolSeparator(" ")
              .toString()}`}</Subtitle3>
          </React.Fragment>
        ) : null}
      </XAxis>
    </Box>
  );
};

export const HistoryDetailSendBaseUILower: FunctionComponent<{
  toAddress: string;
  shortenedToAddress: string;

  toTextWalletIcon?: boolean;
  toText?: string;

  toAmount?: CoinPretty;
}> = ({
  toAddress,
  shortenedToAddress,
  toTextWalletIcon,
  toText,
  toAmount,
}) => {
  return (
    <Box
      width="100%"
      padding="1rem"
      borderRadius="0.375rem"
      backgroundColor={ColorPalette["gray-650"]}
    >
      <XAxis alignY="center">
        <Box minWidth="2rem">
          <Subtitle4 color={ColorPalette["gray-200"]}>To</Subtitle4>
        </Box>
        <Gutter size="0.5rem" />
        <YAxis>
          <Tooltip content={toAddress} allowedPlacements={["top", "right"]}>
            <Box
              backgroundColor={ColorPalette["gray-550"]}
              borderRadius="999px"
              paddingX="0.5rem"
              paddingY="0.25rem"
            >
              <Subtitle3 color={ColorPalette["white"]}>
                {shortenedToAddress}
              </Subtitle3>
            </Box>
          </Tooltip>
          {toText ? (
            <React.Fragment>
              <Gutter size="0.25rem" />
              <XAxis alignY="center">
                {toTextWalletIcon ? (
                  <React.Fragment>
                    <ManIcon size="0.875rem" color={ColorPalette["gray-400"]} />
                    <Gutter size="0.25rem" />
                  </React.Fragment>
                ) : null}
                <Subtitle4 color={ColorPalette["gray-300"]}>{toText}</Subtitle4>
              </XAxis>
            </React.Fragment>
          ) : null}
        </YAxis>
        {toAmount ? (
          <React.Fragment>
            <div style={{ flex: 1 }} />
            <Subtitle3 color={ColorPalette["green-400"]}>{`+ ${toAmount
              .maxDecimals(3)
              .shrink(true)
              .hideIBCMetadata(true)
              .inequalitySymbol(true)
              .inequalitySymbolSeparator(" ")
              .toString()}`}</Subtitle3>
          </React.Fragment>
        ) : null}
      </XAxis>
    </Box>
  );
};

const ArrowDownIcon: FunctionComponent<{
  size: string;
  color: string;
}> = ({ size, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      stroke="none"
      viewBox="0 0 20 20"
    >
      <path
        fill={color}
        fillRule="evenodd"
        d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3"
        clipRule="evenodd"
      />
    </svg>
  );
};

const ManIcon: FunctionComponent<{ size: string; color: string }> = ({
  size,
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      stroke="none"
      viewBox="0 0 14 14"
    >
      <path
        fill={color}
        fillRule="evenodd"
        d="M4.667 4.083a2.333 2.333 0 1 1 4.666 0 2.333 2.333 0 0 1-4.666 0m0 3.5A2.917 2.917 0 0 0 1.75 10.5a1.75 1.75 0 0 0 1.75 1.75h7a1.75 1.75 0 0 0 1.75-1.75 2.917 2.917 0 0 0-2.917-2.917z"
        clipRule="evenodd"
      />
    </svg>
  );
};

export const HistoryDetailSendIcon: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="41"
      height="41"
      fill="none"
      viewBox="0 0 41 41"
    >
      <path
        stroke={ColorPalette["gray-200"]}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.53"
        d="M8.644 31.836 31.836 8.645m0 0H14.442m17.394 0v17.393"
      />
    </svg>
  );
};
