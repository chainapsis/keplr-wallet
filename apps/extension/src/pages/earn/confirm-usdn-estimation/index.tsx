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
import { Link, useSearchParams } from "react-router-dom";
import { DescriptionModal } from "../components/description-modal";
import { useStore } from "../../../stores";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { Checkbox } from "../../../components/checkbox";
import { NOBLE_CHAIN_ID } from "../../../config.ui";

const TERM_AGREED_STORAGE_KEY = "nobleTermAgreed";

export const EarnConfirmUsdnEstimationPage: FunctionComponent = observer(() => {
  const [searchParams] = useSearchParams();
  const intl = useIntl();

  const [isTermAgreed, setIsTermAgreed] = useState(false);
  const [isUsdnDescriptionModalOpen, setIsUsdnDescriptionModalOpen] =
    useState(false);

  const { chainStore } = useStore();
  const chainInfo = chainStore.getChain(NOBLE_CHAIN_ID);
  const currency = chainInfo.forceFindCurrency("uusdc");

  const amountValue = searchParams.get("amount");
  const usdcAmount = new CoinPretty(
    currency,
    DecUtils.getTenExponentN(currency.coinDecimals)
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

  useEffect(() => {
    const storedValue = sessionStorage.getItem(TERM_AGREED_STORAGE_KEY);
    if (storedValue) {
      setIsTermAgreed(storedValue === "true");
    }
  }, []);

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.earn.title" })}
      displayFlex={true}
      fixedHeight={true}
      left={<BackButton />}
      bottomButtons={[
        {
          disabled: !isTermAgreed,
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
        // TO-DO: Tx confirmation modal
      }}
    >
      <Box paddingX="1.25rem" paddingTop="1.75rem" height="100%">
        <H2>
          <FormattedMessage id="page.earn.estimation-confirm.usdc-to-usdn.title" />
        </H2>
        <Gutter size="1rem" />
        <Body2 color={ColorPalette["gray-200"]}>
          <FormattedMessage id="page.earn.estimation-confirm.usdc-to-usdn.paragraph" />
        </Body2>
        <Gutter size="1.75rem" />

        <EstimationSection usdcAmount={usdcAmount} />
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

        <XAxis alignY="center">
          <Box>
            <Checkbox
              size="small"
              checked={isTermAgreed}
              onChange={handleCheckboxChange}
            />
          </Box>
          <Gutter size="0.5rem" />
          <Body2 color={ColorPalette["gray-100"]}>
            <FormattedMessage
              id="page.earn.estimation-confirm.usdc-to-usdn.agree-terms"
              values={{
                link: (texts) => (
                  <Link
                    to="/earn/noble-terms"
                    style={{ textDecoration: "underline", cursor: "pointer" }}
                  >
                    {texts}
                  </Link>
                ),
              }}
            />
          </Body2>
        </XAxis>
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
