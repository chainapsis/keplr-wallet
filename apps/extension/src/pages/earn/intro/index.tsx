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
import { Body2, H1 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { Gutter } from "../../../components/gutter";
import { useStore } from "../../../stores";
import { XAxis } from "../../../components/axis";
import { useGetEarnApy } from "../../../hooks/use-get-apy";
import { Stack } from "../../../components/stack";
import { ArrowRightIcon, CheckIcon } from "../../../components/icon";
import { Modal } from "../../../components/modal";
import { DescriptionModal } from "../components/description-modal";
import { ApyChip } from "../components/chip";
import { useTheme } from "styled-components";
import { NOBLE_CHAIN_ID } from "../../../config.ui";

export const EarnIntroPage: FunctionComponent = observer(() => {
  const [isLearnMoreModalOpen, setIsLearnMoreModalOpen] = useState(false);
  const theme = useTheme();

  const navigate = useNavigate();
  const intl = useIntl();
  const { chainStore } = useStore();

  const [searchParams] = useSearchParams();
  const chainId = searchParams.get("chainId") || NOBLE_CHAIN_ID;
  const coinMinimalDenom = searchParams.get("coinMinimalDenom") || "uusdc";
  const chainInfo = chainStore.getChain(chainId);
  const currency = chainInfo.forceFindCurrency(coinMinimalDenom);

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
      <Box paddingX="1.5rem" paddingTop="1.25rem" paddingBottom="1.5rem">
        <Image
          src={require(theme.mode === "light"
            ? "../../../public/assets/img/earn-usdc-light.png"
            : "../../../public/assets/img/earn-usdc-dark.png")}
          width="52px"
          height="52px"
          alt={currency.coinDenom}
        />

        <Gutter size="1.25rem" />

        <ApyChip chainId={chainId} colorType="green" />
        <Gutter size="1rem" />

        <Stack gutter="0.25rem">
          <H1
            color={
              theme.mode === "light"
                ? ColorPalette["gray-700"]
                : ColorPalette.white
            }
          >
            {intl.formatMessage(
              { id: "page.earn.intro.title" },
              {
                br: <br />,
                image: () => (
                  // text를 감싸는 div의 height에 영향을 미치지 않으면서 이미지를 중앙에 그리기 위해서 이렇게 처리함...
                  <div
                    style={{
                      display: "inline-block",
                      verticalAlign: "middle",
                      height: "0px",
                      width: "1.5rem",
                    }}
                  >
                    <Box
                      width="1.5rem"
                      height="0px"
                      alignX="center"
                      alignY="center"
                    >
                      <Image
                        src={currency.coinImageUrl}
                        style={{
                          width: "1.5rem",
                          height: "1.5rem",
                          borderRadius: "50%",
                          // font 자체가 완벽하게 세로 중앙에 존재하는게 아니기 때문에 수동으로 bottom margin을 조절함...
                          marginBottom: "4px",
                        }}
                        alt={currency.coinDenom}
                      />
                    </Box>
                  </div>
                ),
              }
            )}
          </H1>
        </Stack>

        <Gutter size="1rem" />

        <Body2
          color={
            theme.mode === "light"
              ? ColorPalette["gray-500"]
              : ColorPalette["gray-100"]
          }
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
            <XAxis key={benefit} alignY="center">
              <CheckIcon
                width="1.25rem"
                height="1.25rem"
                color={ColorPalette["green-500"]}
              />
              <Gutter size="0.25rem" />
              <Body2
                key={benefit}
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-100"]
                }
              >
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
            <Body2
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-400"]
                  : ColorPalette["gray-200"]
              }
            >
              {intl.formatMessage({ id: "page.earn.intro.learn-more-button" })}
            </Body2>
            <ArrowRightIcon
              width="1rem"
              height="1rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-500"]
                  : ColorPalette["gray-200"]
              }
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
