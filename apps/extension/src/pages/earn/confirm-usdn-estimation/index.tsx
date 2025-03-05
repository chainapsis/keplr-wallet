import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Box } from "../../../components/box";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { Body2, H2 } from "../../../components/typography";
import { Gutter } from "../../../components/gutter";
import { XAxis } from "../../../components/axis";
import { ColorPalette } from "../../../styles";
import { QuestionIcon } from "../../../components/icon";
import { EstimationSection } from "../components/estimation-section";
import { Modal } from "../../../components/modal";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { DescriptionModal } from "../components/description-modal";
import { useStore } from "../../../stores";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { Checkbox } from "../../../components/checkbox";
import { NOBLE_CHAIN_ID } from "../../../config.ui";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { useGasSimulator, useTxConfigsValidate } from "@keplr-wallet/hooks";
import { useNobleEarnAmountConfig } from "@keplr-wallet/hooks-internal";
import { WarningBox } from "../../../components/warning-box";
import { useTheme } from "styled-components";

const TERM_AGREED_STORAGE_KEY = "nobleTermAgreed";
const NOBLE_EARN_DEPOSIT_IN_COIN_MINIMAL_DENOM = "uusdc";
const NOBLE_EARN_DEPOSIT_OUT_COIN_MINIMAL_DENOM = "uusdn";

export const EarnConfirmUsdnEstimationPage: FunctionComponent = observer(() => {
  const theme = useTheme();
  const isLightMode = theme.mode === "light";

  const [searchParams] = useSearchParams();
  const intl = useIntl();
  const navigate = useNavigate();
  const { chainStore, queriesStore, accountStore } = useStore();

  const [isTermAgreed, setIsTermAgreed] = useState(false);
  const [isUsdnDescriptionModalOpen, setIsUsdnDescriptionModalOpen] =
    useState(false);

  const chainInfo = chainStore.getChain(NOBLE_CHAIN_ID);
  const account = accountStore.getAccount(NOBLE_CHAIN_ID);

  const amountValue = searchParams.get("amount");

  const inCurrency = chainInfo.forceFindCurrency(
    NOBLE_EARN_DEPOSIT_IN_COIN_MINIMAL_DENOM
  );
  const outCurrency = chainInfo.forceFindCurrency(
    NOBLE_EARN_DEPOSIT_OUT_COIN_MINIMAL_DENOM
  );
  const inAmount = new CoinPretty(
    inCurrency,
    DecUtils.getTenExponentN(inCurrency.coinDecimals)
      .mul(new Dec(amountValue || "0"))
      .toString()
  );

  const handleCheckboxChange = () => {
    setIsTermAgreed((prevState) => {
      const newValue = !prevState;
      sessionStorage.setItem(TERM_AGREED_STORAGE_KEY, newValue.toString());
      return newValue;
    });
  };

  const nobleEarnAmountConfig = useNobleEarnAmountConfig(
    chainStore,
    queriesStore,
    accountStore,
    NOBLE_CHAIN_ID,
    account.bech32Address,
    inCurrency,
    outCurrency
  );

  const poolForDeposit = nobleEarnAmountConfig.amountConfig.pool;

  const gasSimulator = useGasSimulator(
    new ExtensionKVStore("gas-simulator.main.send"),
    chainStore,
    NOBLE_CHAIN_ID,
    nobleEarnAmountConfig.gasConfig,
    nobleEarnAmountConfig.feeConfig,
    "noble-earn-deposit",
    () => {
      if (!nobleEarnAmountConfig.amountConfig.currency) {
        throw new Error("Deposit currency not set");
      }

      if (
        nobleEarnAmountConfig.amountConfig.uiProperties.loadingState ===
          "loading-block" ||
        nobleEarnAmountConfig.amountConfig.uiProperties.error != null
      ) {
        throw new Error("Not ready to simulate tx");
      }

      return account.noble.makeSwapTx(
        "noble-earn-deposit",
        nobleEarnAmountConfig.amountConfig.amount[0].toDec().toString(),
        inCurrency,
        nobleEarnAmountConfig.amountConfig.minOutAmount.toDec().toString(),
        outCurrency,
        [
          {
            poolId: poolForDeposit?.id.toString() ?? "",
            denomTo: outCurrency.coinMinimalDenom,
          },
        ]
      );
    }
  );

  const txConfigsValidate = useTxConfigsValidate({
    ...nobleEarnAmountConfig,
    gasSimulator,
  });

  useEffect(() => {
    nobleEarnAmountConfig.amountConfig.setValue(amountValue || "0");
  }, [amountValue, nobleEarnAmountConfig.amountConfig]);

  useEffect(() => {
    const storedValue = sessionStorage.getItem(TERM_AGREED_STORAGE_KEY);
    if (storedValue) {
      setIsTermAgreed(storedValue === "true");
    }
  }, []);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem(TERM_AGREED_STORAGE_KEY);
    };
  }, []);

  return (
    <HeaderLayout
      title=""
      displayFlex={true}
      fixedHeight={false}
      left={<BackButton />}
      bottomButtons={[
        {
          disabled:
            !isTermAgreed ||
            txConfigsValidate.interactionBlocked ||
            !!nobleEarnAmountConfig.amountConfig.error,
          text: intl.formatMessage({
            id: "page.earn.estimation-confirm.usdc-to-usdn.swap-button",
          }),
          color: "primary",
          size: "large",
          type: "submit",
        },
      ]}
      onSubmit={async (e) => {
        e.preventDefault();

        if (!isTermAgreed) {
          return;
        }
        try {
          if (!poolForDeposit) {
            throw new Error("No pool for deposit");
          }

          const tx = account.noble.makeSwapTx(
            "noble-earn-deposit",
            nobleEarnAmountConfig.amountConfig.amount[0].toDec().toString(),
            inCurrency,
            nobleEarnAmountConfig.amountConfig.minOutAmount.toDec().toString(),
            outCurrency,
            [
              {
                poolId: poolForDeposit?.id.toString() ?? "",
                denomTo: outCurrency.coinMinimalDenom,
              },
            ]
          );

          await tx.send(
            nobleEarnAmountConfig.feeConfig.toStdFee(),
            undefined,
            undefined,
            {
              onBroadcasted: (_txHash) => {
                navigate("/tx-result/pending");

                // TODO: Log analytics
              },
              onFulfill: (tx: any) => {
                if (tx.code != null && tx.code !== 0) {
                  console.log(tx.log ?? tx.raw_log);
                  navigate("/tx-result/failed");

                  return;
                }

                navigate("/tx-result/success");
              },
            }
          );
        } catch (e) {
          if (e?.message === "Request rejected") {
            return;
          }
          console.error(e);
          navigate("/tx-result/failed");
        }
      }}
    >
      <Box paddingX="1.25rem" paddingTop="1.75rem" height="100%">
        <H2>
          <FormattedMessage
            id="page.earn.estimation-confirm.usdc-to-usdn.title"
            values={{
              br: <br />,
            }}
          />
        </H2>
        <Gutter size="1rem" />
        <Body2
          color={
            isLightMode ? ColorPalette["gray-400"] : ColorPalette["gray-200"]
          }
        >
          <FormattedMessage
            id="page.earn.estimation-confirm.usdc-to-usdn.paragraph"
            values={{
              br: <br />,
            }}
          />
        </Body2>
        <Gutter size="1.75rem" />

        <EstimationSection
          inAmount={inAmount}
          outAmount={nobleEarnAmountConfig.amountConfig.minOutAmount}
        />
        <Gutter size="1.25rem" />

        <Box
          onClick={() => {
            setIsUsdnDescriptionModalOpen(true);
          }}
          cursor="pointer"
        >
          <XAxis alignY="center">
            <Body2 color={ColorPalette["gray-300"]}>
              <FormattedMessage id="page.earn.estimation-confirm.usdn-description.title" />
            </Body2>
            <Gutter size="0.25rem" />
            <QuestionIcon
              width="1rem"
              height="1rem"
              color={ColorPalette["gray-300"]}
            />
          </XAxis>
        </Box>

        <Gutter size="2rem" />

        <XAxis>
          <Box
            marginTop="0.125rem"
            onClick={handleCheckboxChange}
            cursor="pointer"
          >
            <Checkbox size="small" checked={isTermAgreed} onChange={() => {}} />
          </Box>
          <Gutter size="0.5rem" />
          <Body2
            color={
              isLightMode ? ColorPalette["gray-400"] : ColorPalette["gray-200"]
            }
            onClick={handleCheckboxChange}
            style={{
              cursor: "pointer",
            }}
          >
            <FormattedMessage
              id="page.earn.estimation-confirm.usdc-to-usdn.agree-terms"
              values={{
                link: (texts) => (
                  <Link
                    to="/earn/noble-terms"
                    style={{
                      textDecoration: "underline",
                      cursor: "pointer",
                      color: "inherit",
                    }}
                  >
                    {texts}
                  </Link>
                ),
              }}
            />
          </Body2>
        </XAxis>

        {nobleEarnAmountConfig.amountConfig.error && (
          <Box marginTop="1rem">
            <WarningBox
              title={nobleEarnAmountConfig.amountConfig.error?.message ?? ""}
            />
          </Box>
        )}
      </Box>

      <Modal
        isOpen={isUsdnDescriptionModalOpen}
        close={() => {
          setIsUsdnDescriptionModalOpen(false);
        }}
        align="bottom"
      >
        <DescriptionModal
          close={() => {
            setIsUsdnDescriptionModalOpen(false);
          }}
          title={intl.formatMessage({
            id: "page.earn.estimation-confirm.usdn-description.title",
          })}
          paragraphs={[
            intl.formatMessage({
              id: "page.earn.estimation-confirm.usdn-description.paragraph.first",
            }),
            intl.formatMessage({
              id: "page.earn.estimation-confirm.usdn-description.paragraph.second",
            }),
          ]}
        />
      </Modal>
    </HeaderLayout>
  );
});
