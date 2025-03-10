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
import { FeeType, useTxConfigsValidate } from "@keplr-wallet/hooks";
import { useNobleEarnAmountConfig } from "@keplr-wallet/hooks-internal";
import { WarningBox } from "../../../components/warning-box";
import styled, { useTheme } from "styled-components";

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
  const gasValue = searchParams.get("gas");
  const feeMinimalDenom = searchParams.get("feeCurrency");
  const feeType = searchParams.get("feeType");

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

  const txConfigsValidate = useTxConfigsValidate({
    ...nobleEarnAmountConfig,
  });

  useEffect(() => {
    nobleEarnAmountConfig.amountConfig.setValue(amountValue || "0");
    if (gasValue) {
      nobleEarnAmountConfig.gasConfig.setValue(gasValue);
    }
    if (feeMinimalDenom && feeType) {
      const feeCurrency = chainStore
        .getChain(NOBLE_CHAIN_ID)
        .feeCurrencies.find(
          (feeCurrency) => feeCurrency.coinMinimalDenom === feeMinimalDenom
        );
      if (feeCurrency) {
        nobleEarnAmountConfig.feeConfig.setFee({
          type: feeType as FeeType,
          currency: feeCurrency,
        });
      }
    }
  }, [
    amountValue,
    nobleEarnAmountConfig.amountConfig,
    gasValue,
    nobleEarnAmountConfig.gasConfig,
    feeMinimalDenom,
    feeType,
    nobleEarnAmountConfig.feeConfig,
    chainStore,
  ]);

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

  const isSubmissionBlocked =
    nobleEarnAmountConfig.amountConfig.amount[0].toDec().equals(new Dec("0")) ||
    nobleEarnAmountConfig.amountConfig.expectedOutAmount
      .toDec()
      .equals(new Dec("0")) ||
    !!nobleEarnAmountConfig.amountConfig.error ||
    txConfigsValidate.interactionBlocked ||
    !isTermAgreed;

  return (
    <HeaderLayout
      title=""
      displayFlex={true}
      fixedHeight={false}
      left={<BackButton />}
      bottomButtons={[
        {
          disabled: isSubmissionBlocked,
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

        if (isSubmissionBlocked) {
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
            {
              // max일 경우 서명 페이지에서 수수료를 수정할 수 없게 만든다.
              preferNoSetFee: searchParams.get("isMax") === "true",
            },
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

                navigate("/tx-result/success?isFromEarnDeposit=true");
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
          outAmount={nobleEarnAmountConfig.amountConfig.expectedOutAmount}
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
            <FormattedMessage
              key="page.earn.estimation-confirm.usdn-description.paragraph.first"
              id="page.earn.estimation-confirm.usdn-description.paragraph.first"
            />,
            <FormattedMessage
              key="page.earn.estimation-confirm.usdn-description.paragraph.second"
              id="page.earn.estimation-confirm.usdn-description.paragraph.second"
              values={{
                link: (...chunks: any) => (
                  <Styles.Link
                    onClick={(e) => {
                      e.preventDefault();

                      browser.tabs.create({
                        url: LEARN_MORE_URL,
                      });
                    }}
                  >
                    {chunks}
                  </Styles.Link>
                ),
              }}
            />,
          ]}
        />
      </Modal>
    </HeaderLayout>
  );
});

const LEARN_MORE_URL = "https://help.keplr.app/articles/earn-more-with-keplr";

const Styles = {
  Link: styled.span`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-600"]
        : ColorPalette["gray-50"]};

    cursor: pointer;
    text-decoration: underline;
  `,
};
