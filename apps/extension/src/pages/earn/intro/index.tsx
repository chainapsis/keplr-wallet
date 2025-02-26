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
import { Body2, H1, Subtitle4 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { Gutter } from "../../../components/gutter";
import { useStore } from "../../../stores";
import { XAxis } from "../../../components/axis";
import { useGetEarnApy } from "../../../hooks/use-get-apy";
import { Stack } from "../../../components/stack";
import { ArrowRightIcon, CheckIcon } from "../../../components/icon";
import { Modal } from "../../../components/modal";
import { DescriptionModal } from "../components/description-modal";
import { NOBLE_CHAIN_ID } from "../../../config.ui";

export const EarnIntroPage: FunctionComponent = observer(() => {
  const [isLearnMoreModalOpen, setIsLearnMoreModalOpen] = useState(false);

  const navigate = useNavigate();
  const intl = useIntl();
  const { chainStore } = useStore();

  const [searchParams] = useSearchParams();
  const chainId = searchParams.get("chainId") || NOBLE_CHAIN_ID;
  const coinMinimalDenom = searchParams.get("coinMinimalDenom") || "uusdc";
  const chainInfo = chainStore.getChain(chainId);
  const currency =
    chainInfo.currencies.find(
      (currency) => currency.coinMinimalDenom === coinMinimalDenom
    ) ?? chainInfo.currencies[0];

  const { apy } = useGetEarnApy(chainId);

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
          <H1>
            {intl.formatMessage(
              { id: "page.earn.intro.title" },
              {
                token: () => (
                  <Box style={{ display: "inline-block" }}>
                    <XAxis alignY="center">
                      <Image
                        src={currency.coinImageUrl}
                        width="24px"
                        height="24px"
                        style={{ borderRadius: "50%" }}
                        alt={currency.coinDenom}
                      />
                      <Gutter size="0.25rem" />
                      {currency.coinDenom}
                    </XAxis>
                  </Box>
                ),
              }
            )}
          </H1>
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
            navigate(
              `/earn/amount?chainId=${chainId}&coinMinimalDenom=${coinMinimalDenom}`
            );
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
        <DescriptionModal
          close={() => setIsLearnMoreModalOpen(false)}
          title={intl.formatMessage({
            id: "page.earn.intro.learn-more-modal.title",
          })}
          paragraphs={[
            intl.formatMessage({
              id: "page.earn.intro.learn-more-modal.paragraph.first",
            }),
            intl.formatMessage({
              id: "page.earn.intro.learn-more-modal.paragraph.second",
            }),
          ]}
        />
      </Modal>
    </HeaderLayout>
  );
});
