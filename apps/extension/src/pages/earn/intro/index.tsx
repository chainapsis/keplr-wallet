import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";

import { useIntl } from "react-intl";

import { Button } from "../../../components/button";
import { useNavigate } from "react-router";
import { Box } from "../../../components/box";
import { Image } from "../../../components/image";
import { useSearchParams } from "react-router-dom";
import { Body2, H1, H4, Subtitle4 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { Gutter } from "../../../components/gutter";
import { useStore } from "../../../stores";
import { XAxis } from "../../../components/axis";
import { useGetApy } from "../../../hooks/use-get-apy";
import { Stack } from "../../../components/stack";
import {
  ArrowRightIcon,
  CheckIcon,
  InformationPlainIcon,
} from "../../../components/icon";
import { Modal } from "../../../components/modal";
import styled from "styled-components";

export const EarnIntroPage: FunctionComponent = observer(() => {
  const [isLearnMoreModalOpen, setIsLearnMoreModalOpen] = useState(false);

  const navigate = useNavigate();
  const intl = useIntl();
  const { chainStore } = useStore();

  const [searchParams] = useSearchParams();
  const chainId = searchParams.get("chainId") || "noble-1"; // Noble testnet: "grand-1", mainnet: "noble-1"
  const coinMinimalDenom = searchParams.get("coinMinimalDenom") || "uusdc";
  const chainInfo = chainStore.getChain(chainId);
  const currency =
    chainInfo.currencies.find(
      (currency) => currency.coinMinimalDenom === coinMinimalDenom
    ) ?? chainInfo.currencies[0];

  const { apy } = useGetApy(chainId);

  const benefits = [
    intl.formatMessage({ id: "page.earn.intro.benefits.no-lockup" }),
    intl.formatMessage({ id: "page.earn.intro.benefits.daily-accrued" }),
    intl.formatMessage({ id: "page.earn.intro.benefits.simple-and-easy" }),
  ];

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.earn.title" })}
      fixedHeight={true}
      left={<BackButton />}
    >
      <Box paddingX="1.5rem" paddingTop="2rem" paddingBottom="1.5rem">
        {/* TO-DO: this image is a dummy that needs to be replaced with the actual graphic */}
        <Image
          src={currency.coinImageUrl}
          width="48px"
          height="48px"
          style={{ borderRadius: "50%" }}
          alt={currency.coinDenom}
        />

        <Gutter size="1.25rem" />

        <Subtitle4 color={ColorPalette["blue-300"]}>
          {intl.formatMessage({ id: "page.earn.title" }).toUpperCase()}
        </Subtitle4>
        <Gutter size="1rem" />

        <Stack gutter="0.25rem">
          <H1>{intl.formatMessage({ id: "page.earn.intro.title" })}</H1>
          <XAxis alignY="center">
            <Image
              src={currency.coinImageUrl}
              width="24px"
              height="24px"
              style={{ borderRadius: "50%" }}
              alt={currency.coinDenom}
            />
            <Gutter size="0.25rem" />
            <H1 style={{ color: ColorPalette["blue-300"] }}>
              {currency.coinDenom}
            </H1>
          </XAxis>
        </Stack>

        <Gutter size="1rem" />

        <Body2
          color={ColorPalette["gray-100"]}
          style={{ lineHeight: "1.225rem" }}
        >
          {intl.formatMessage(
            { id: "page.earn.intro.paragraph" },
            { apy: apy || "-" }
          )}
        </Body2>

        <Gutter size="1.5rem" />

        <Stack gutter="0.75rem">
          {benefits.map((benefit) => (
            <XAxis key={benefit}>
              <CheckIcon
                width="1.25rem"
                height="1.25rem"
                color={ColorPalette["green-500"]}
              />
              <Gutter size="0.25rem" />
              <Body2 key={benefit} color={ColorPalette["gray-100"]}>
                {benefit}
              </Body2>
            </XAxis>
          ))}
        </Stack>
      </Box>

      <Box
        paddingX="0.75rem"
        paddingBottom="0.75rem"
        position="fixed"
        style={{ bottom: 12, left: 0, right: 0 }}
      >
        <Button
          style={{ marginTop: "auto" }}
          size="large"
          color="primary"
          text={intl.formatMessage({
            id: "page.earn.intro.start-earning-button",
          })}
          onClick={() => {
            navigate(`/earn/amount?chainId=${chainId}`);
          }}
        />
        <Gutter size="1.5rem" />

        <Box
          width="100%"
          onClick={() => setIsLearnMoreModalOpen(true)}
          alignX="center"
          style={{ cursor: "pointer" }}
        >
          <XAxis alignY="center">
            <Body2 color={ColorPalette["gray-200"]}>
              {intl.formatMessage({ id: "page.earn.intro.learn-more-button" })}
            </Body2>
            <ArrowRightIcon
              width="1rem"
              height="1rem"
              color={ColorPalette["gray-200"]}
            />
          </XAxis>
        </Box>
      </Box>

      <Modal
        isOpen={isLearnMoreModalOpen}
        close={() => setIsLearnMoreModalOpen(false)}
        align="bottom"
      >
        <LearnMoreModal close={() => setIsLearnMoreModalOpen(false)} />
      </Modal>
    </HeaderLayout>
  );
});

const LearnMoreModal: FunctionComponent<{
  close: () => void;
}> = observer(({ close }) => {
  const intl = useIntl();

  return (
    <Styles.Container>
      <Box paddingX="0.25rem" paddingY="0.5rem" marginBottom="0.75rem">
        <XAxis alignY="center">
          <InformationPlainIcon
            width="1.25rem"
            height="1.25rem"
            color={ColorPalette["gray-300"]}
          />
          <Gutter size="0.5rem" />
          <H4 color={ColorPalette.white}>
            {intl.formatMessage({
              id: "page.earn.intro.learn-more-modal.title",
            })}
          </H4>
        </XAxis>
      </Box>

      <Box paddingX="0.5rem">
        <Body2>
          {intl.formatMessage({
            id: "page.earn.intro.learn-more-modal.paragraph.first",
          })}
        </Body2>
        <Gutter size="0.75rem" />
        <Body2>
          {intl.formatMessage({
            id: "page.earn.intro.learn-more-modal.paragraph.second",
          })}
        </Body2>

        <Gutter size="1.25rem" />
      </Box>

      <Button
        size="large"
        color="primary"
        text={intl.formatMessage({
          id: "page.earn.intro.learn-more-modal.got-it-button",
        })}
        onClick={close}
      />
    </Styles.Container>
  );
});

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 1rem;
    padding-top: 0.88rem;

    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-600"]};
  `,
};
