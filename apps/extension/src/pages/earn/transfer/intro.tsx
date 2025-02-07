import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";

import { useIntl } from "react-intl";

import { Body2, Body3, Caption1, H2 } from "../../../components/typography";
import { Box } from "../../../components/box";
import { useNavigate } from "react-router-dom";
import { Gutter } from "../../../components/gutter";
import { Column, Columns } from "../../../components/column";
import { ColorPalette } from "../../../styles";
import { Stack } from "../../../components/stack";

export const EarnTransferIntroPage: FunctionComponent = observer(() => {
  const intl = useIntl();
  const navigate = useNavigate();

  return (
    <HeaderLayout
      title={""}
      displayFlex={true}
      fixedHeight={true}
      left={<BackButton />}
      bottomButtons={[
        {
          text: intl.formatMessage({ id: "button.next" }),
          color: "primary",
          size: "large",
          type: "submit",
        },
      ]}
      onSubmit={async (e) => {
        e.preventDefault();

        navigate(
          `/send/select-asset?isNobleEarn=true&navigateTo=${encodeURIComponent(
            "/send/simple-ibc-transfer?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}&ibcTransferDestinationChainId=noble-1"
          )}`
        );
      }}
    >
      <Box paddingX="1.5rem" paddingTop="2rem">
        <H2 color={ColorPalette["white"]}>
          {intl.formatMessage(
            {
              id: "page.earn.transfer.intro.title",
            },
            {
              br: <br />,
            }
          )}
        </H2>
        <Gutter size="2rem" />
        <Columns sum={1} gutter="0.75rem">
          <Column weight={0}>
            <Stack alignX="center" gutter="0.5rem">
              <Box
                width="1.5rem"
                height="1.5rem"
                padding="0.25rem"
                backgroundColor={ColorPalette["gray-600"]}
                borderRadius="50%"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Caption1 color={ColorPalette["white"]}>1</Caption1>
              </Box>
              <Box
                width="0.125rem"
                height="2.125rem"
                backgroundColor={ColorPalette["gray-500"]}
                borderRadius="0.125rem"
              />
              <Box
                width="1.5rem"
                height="1.5rem"
                padding="0.25rem"
                backgroundColor={ColorPalette["gray-600"]}
                borderRadius="50%"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Caption1 color={ColorPalette["white"]}>2</Caption1>
              </Box>
            </Stack>
          </Column>
          <Column weight={1}>
            <Stack>
              <Box paddingY="0.21875rem">
                <Body2 color={ColorPalette["white"]}>
                  {intl.formatMessage({
                    id: "page.earn.transfer.intro.paragraph.first",
                  })}
                </Body2>
              </Box>
              <Body3 color={ColorPalette["gray-200"]}>
                {intl.formatMessage({
                  id: "page.earn.transfer.intro.paragraph.first.sub-paragraph",
                })}
              </Body3>
              <Gutter size="2.25rem" />
              <Box paddingY="0.21875rem">
                <Body2 color={ColorPalette["white"]}>
                  {intl.formatMessage({
                    id: "page.earn.transfer.intro.paragraph.second",
                  })}
                </Body2>
              </Box>
            </Stack>
          </Column>
        </Columns>
      </Box>
    </HeaderLayout>
  );
});
