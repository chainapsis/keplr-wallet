import React, { FunctionComponent } from "react";
import { Box } from "../../components/box";
import { Gutter } from "../../components/gutter";
import { MsgHistory } from "../main/token-detail/types";
import { XAxis } from "../../components/axis";
import { Subtitle3, Subtitle4 } from "../../components/typography";
import { useIntl } from "react-intl";
import { ColorPalette } from "../../styles";
import { useStore } from "../../stores";
import { Buffer } from "buffer/";
import { ChainImageFallback } from "../../components/image";
import { observer } from "mobx-react-lite";
import { CoinPretty } from "@keplr-wallet/unit";
import { LoadingIcon } from "../../components/icon";
import { useTheme } from "styled-components";

export const HistoryDetailCommonBottomSection: FunctionComponent<{
  msg: MsgHistory;
}> = observer(({ msg }) => {
  const { chainStore, queriesStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();

  const fee: string | undefined = (() => {
    if (chainStore.isEvmOnlyChain(msg.chainId)) {
    } else {
      const queryTx = queriesStore.simpleQuery.queryGet<{
        authInfo: {
          fee: {
            amount: {
              denom: string;
              amount: string;
            }[];
            gas_limit: "104250";
            payer: "";
            granter: "";
          };
          tip: null;
        };
      }>(
        process.env["KEPLR_EXT_TX_HISTORY_BASE_URL"] || "",
        `/block/txs/by-hash/${msg.chainIdentifier}/${msg.txHash}`
      );

      if (queryTx.response?.data) {
        const feeAmountRaw: {
          denom: string;
          amount: string;
        }[] = queryTx.response.data.authInfo.fee.amount;

        if (feeAmountRaw.length === 0) {
          return "-";
        }

        const pretties: CoinPretty[] = [];
        for (const amt of feeAmountRaw) {
          const curreny = chainStore
            .getChain(msg.chainIdentifier)
            .findCurrency(amt.denom);
          if (!curreny) {
            return "Unknown";
          }
          pretties.push(new CoinPretty(curreny, amt.amount));
        }

        return pretties
          .map((pretty) =>
            pretty
              .maxDecimals(5)
              .shrink(true)
              .hideIBCMetadata(true)
              .inequalitySymbol(true)
              .inequalitySymbolSeparator(" ")
              .toString()
          )
          .join(", ");
      }
    }
  })();

  return (
    <React.Fragment>
      <Box
        padding="1rem"
        borderRadius="0.375rem"
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["white"]
            : ColorPalette["gray-650"]
        }
        style={{
          boxShadow:
            theme.mode === "light"
              ? "0 1px 4px 0 rgba(43, 39, 55, 0.10)"
              : undefined,
        }}
      >
        <XAxis alignY="center">
          <Subtitle4
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"]
            }
          >
            Transaction Status
          </Subtitle4>
          <div style={{ flex: 1 }} />
          <Subtitle3
            color={(() => {
              if (theme.mode === "light") {
                return !msg.code
                  ? ColorPalette["green-500"]
                  : ColorPalette["yellow-400"];
              }

              return !msg.code
                ? ColorPalette["green-400"]
                : ColorPalette["yellow-400"];
            })()}
          >
            {!msg.code ? "Success" : "Failed"}
          </Subtitle3>
        </XAxis>
        <Gutter size="1rem" />
        <XAxis alignY="center">
          <Subtitle4
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"]
            }
          >
            Date & Time
          </Subtitle4>
          <div style={{ flex: 1 }} />
          <Subtitle3
            color={
              theme.mode === "light"
                ? ColorPalette["gray-700"]
                : ColorPalette["gray-50"]
            }
          >
            {intl.formatDate(new Date(msg.time), {
              year: "numeric",
              month: "long",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </Subtitle3>
        </XAxis>
      </Box>
      <Gutter size="0.5rem" />
      <Box
        padding="1rem"
        borderRadius="0.375rem"
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["white"]
            : ColorPalette["gray-650"]
        }
        style={{
          boxShadow:
            theme.mode === "light"
              ? "0 1px 4px 0 rgba(43, 39, 55, 0.10)"
              : undefined,
        }}
      >
        <XAxis alignY="center">
          <Subtitle4
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"]
            }
          >
            Network
          </Subtitle4>
          <div style={{ flex: 1 }} />
          <XAxis alignY="center">
            <Subtitle3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["gray-50"]
              }
            >
              {(() => {
                if (chainStore.hasModularChain(msg.chainId)) {
                  const modularChainInfo = chainStore.getModularChain(
                    msg.chainId
                  );
                  return modularChainInfo.chainName;
                }

                return "Unknown";
              })()}
            </Subtitle3>
            {chainStore.hasModularChain(msg.chainId) ? (
              <React.Fragment>
                <Gutter size="0.25rem" />
                <ChainImageFallback
                  size="1.25rem"
                  chainInfo={chainStore.getModularChain(msg.chainId)}
                />
              </React.Fragment>
            ) : null}
          </XAxis>
        </XAxis>
        <Gutter size="1rem" />
        <XAxis alignY="center">
          <Subtitle4
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"]
            }
          >
            Transaction Fee
          </Subtitle4>
          <div style={{ flex: 1 }} />
          <Subtitle3
            color={
              theme.mode === "light"
                ? ColorPalette["gray-700"]
                : ColorPalette["gray-50"]
            }
          >
            {fee == null ? (
              <LoadingIcon
                width="0.75rem"
                height="0.75rem"
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-700"]
                    : ColorPalette["gray-50"]
                }
              />
            ) : (
              fee || "-"
            )}
          </Subtitle3>
        </XAxis>
        <Gutter size="1rem" />
        <XAxis alignY="center">
          <Subtitle4
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"]
            }
          >
            Tx Hash
          </Subtitle4>
          <div style={{ flex: 1 }} />
          <Subtitle3 color={ColorPalette["gray-300"]}>
            {(() => {
              try {
                const hex = Buffer.from(msg.txHash.replace("0x", ""), "hex")
                  .toString("hex")
                  .toUpperCase();
                return `0x${hex.slice(0, 5)}...${hex.slice(-5)}`;
              } catch {
                return "Unknown";
              }
            })()}
          </Subtitle3>
        </XAxis>
      </Box>
    </React.Fragment>
  );
});
