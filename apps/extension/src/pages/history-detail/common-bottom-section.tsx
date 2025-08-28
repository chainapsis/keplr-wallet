import React, {
  forwardRef,
  FunctionComponent,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Box } from "../../components/box";
import { Gutter } from "../../components/gutter";
import { MsgHistory } from "../main/token-detail/types";
import { XAxis } from "../../components/axis";
import { Button2, Subtitle3, Subtitle4 } from "../../components/typography";
import { useIntl } from "react-intl";
import { ColorPalette } from "../../styles";
import { useStore } from "../../stores";
import { Buffer } from "buffer/";
import { ChainImageFallback } from "../../components/image";
import { observer } from "mobx-react-lite";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { LoadingIcon } from "../../components/icon";
import { useTheme } from "styled-components";
import lottie, { AnimationItem } from "lottie-web";
import AnimCheckLight from "../../public/assets/lottie/register/check-circle-icon-light.json";
import AnimCheck from "../../public/assets/lottie/register/check-circle-icon.json";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export const HistoryDetailCommonBottomSection: FunctionComponent<{
  msg: MsgHistory;
}> = observer(({ msg }) => {
  const { chainStore, queriesStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();

  const fee: string | undefined = (() => {
    if (chainStore.isEvmOnlyChain(msg.chainId)) {
      // EVM 트랜잭션의 수수료 계산 로직
      const res = queriesStore.simpleQuery.queryGet<{
        tx_fee?: string;
      }>(
        "https://keplr-api.keplr.app",
        `/v1/evm/tx?chain_identifier=${msg.chainId}&tx_hash=0x${msg.txHash}`
      );

      if (res.response?.data) {
        const txData = res.response.data;

        if (!txData.tx_fee) {
          return "-";
        }

        const amt = new Int(txData.tx_fee);
        const chainInfo = chainStore.getChain(msg.chainId);
        if (chainInfo.feeCurrencies.length === 0) {
          return "-";
        }
        const feeCurrency = chainInfo.feeCurrencies[0];
        const pretty = new CoinPretty(feeCurrency, amt);
        return pretty
          .maxDecimals(5)
          .shrink(true)
          .hideIBCMetadata(true)
          .inequalitySymbol(true)
          .inequalitySymbolSeparator(" ")
          .toString();
      }
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

  const copyIconButtonRef = useRef<CopyIconButtonRef | null>(null);
  const txHashShortText = (() => {
    try {
      const hex = Buffer.from(msg.txHash.replace("0x", ""), "hex")
        .toString("hex")
        .toUpperCase();
      return `0x${hex.slice(0, 5)}...${hex.slice(-5)}`;
    } catch {
      return "Unknown";
    }
  })();

  const queryExplorer = queriesStore.simpleQuery.queryGet<{
    link: string;
  }>(
    process.env["KEPLR_EXT_CONFIG_SERVER"],
    `/tx-history/explorer/${ChainIdHelper.parse(msg.chainId).identifier}`
  );

  const explorerUrl = queryExplorer.response?.data.link || "";

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
          <Box
            cursor="pointer"
            onClick={(e) => {
              e.preventDefault();

              copyIconButtonRef.current?.startAnimation();

              navigator.clipboard.writeText("0x" + msg.txHash);
            }}
          >
            <XAxis alignY="center">
              <Subtitle3 color={ColorPalette["gray-300"]}>
                {txHashShortText}
              </Subtitle3>
              <Gutter size="0.25rem" />
              <CopyIconButton ref={copyIconButtonRef} />
            </XAxis>
          </Box>
        </XAxis>
      </Box>
      <Gutter size="1.75rem" />
      {explorerUrl ? (
        <React.Fragment>
          <Box
            alignX="center"
            cursor="pointer"
            onClick={(e) => {
              e.preventDefault();

              browser.tabs.create({
                url: explorerUrl
                  .replace("{txHash}", msg.txHash.toUpperCase())
                  .replace("{txHash:lowercase}", msg.txHash.toLowerCase())
                  .replace("{txHash:uppercase}", msg.txHash.toUpperCase()),
              });
            }}
          >
            <XAxis alignY="center">
              <Button2
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-50"]
                }
              >
                View on Explorer
              </Button2>
              <Gutter size="0.25rem" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="19"
                fill="none"
                stroke="none"
                viewBox="0 0 19 19"
              >
                <path
                  stroke={
                    theme.mode === "light"
                      ? ColorPalette["gray-300"]
                      : ColorPalette["gray-50"]
                  }
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M10.625 5H4.438c-.932 0-1.688.756-1.688 1.688v7.875c0 .931.756 1.687 1.688 1.687h7.875c.931 0 1.687-.755 1.687-1.687V8.375m-7.875 4.5L16.25 2.75m0 0h-3.937m3.937 0v3.938"
                />
              </svg>
            </XAxis>
          </Box>
          <Gutter size="1.75rem" />
        </React.Fragment>
      ) : null}
    </React.Fragment>
  );
});

interface CopyIconButtonRef {
  startAnimation: () => void;
}

// eslint-disable-next-line react/display-name
const CopyIconButton = forwardRef<CopyIconButtonRef>((_, ref) => {
  const theme = useTheme();

  const [isAnimating, setIsAnimating] = useState(false);

  const checkAnimDivRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (checkAnimDivRef.current) {
      const anim = lottie.loadAnimation({
        container: checkAnimDivRef.current,
        renderer: "svg",
        autoplay: false,
        loop: false,
        animationData: theme.mode === "light" ? AnimCheckLight : AnimCheck,
      });

      anim.addEventListener("enterFrame", () => {
        setIsAnimating(true);
      });

      anim.addEventListener("complete", () => {
        setTimeout(() => {
          setIsAnimating(false);
        }, 1500);
      });

      animationRef.current = anim;

      return () => {
        anim.destroy();
        animationRef.current = null;
      };
    }
  }, [theme.mode]);

  useImperativeHandle(ref, () => {
    return {
      startAnimation: () => {
        if (animationRef.current) {
          animationRef.current.goToAndPlay(0);
        }
      },
    };
  });

  return (
    <div
      style={{
        position: "relative",
        width: "18px",
        height: "18px",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        fill="none"
        stroke="none"
        viewBox="0 0 18 18"
        style={{
          opacity: isAnimating ? 0 : 1,
        }}
      >
        <path
          stroke={ColorPalette["gray-300"]}
          strokeLinecap="round"
          strokeWidth="1.5"
          d="M12 3H4.8A1.8 1.8 0 0 0 3 4.8V12"
        />
        <rect
          width="9"
          height="9"
          x="6"
          y="6"
          stroke={ColorPalette["gray-300"]}
          strokeWidth="1.5"
          rx="1.05"
        />
      </svg>
      <div
        ref={checkAnimDivRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: isAnimating ? 1 : 0,
        }}
      />
    </div>
  );
});
