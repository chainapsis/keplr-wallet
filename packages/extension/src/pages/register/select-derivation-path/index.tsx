import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useRegisterHeader } from "../components/header";
import { useSceneEvents } from "../../../components/transition";
import { RegisterSceneBox } from "../components/register-scene-box";
import {
  Body1,
  Body2,
  H3,
  H5,
  Subtitle3,
} from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import { Column, Columns } from "../../../components/column";
import { ChainImageFallback } from "../../../components/image";
import { Stack } from "../../../components/stack";
import { Box } from "../../../components/box";
import Color from "color";
import { Styles } from "./styles";
import { WalletIcon } from "../../../components/icon/wallet";
import { Button } from "../../../components/button";

export const SelectDerivationPathScene: FunctionComponent = observer(() => {
  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "step",
        title: "Select Account Derivation Path",
        paragraphs: [
          <Body1 color={ColorPalette["gray-300"]} key="1">
            To use both paths, you need to go through the import process twice.
          </Body1>,
        ],
        stepCurrent: 3,
        stepTotal: 6,
      });
    },
  });

  return (
    <RegisterSceneBox>
      <YAxis alignX="center">
        <Subtitle3 color={ColorPalette["gray-200"]}>Chains 2/4</Subtitle3>

        <Gutter size="0.75rem" />

        <Box
          padding="0.75rem 2rem 0.75rem 0.75rem"
          borderRadius="3.5rem"
          backgroundColor={Color(ColorPalette["gray-500"])
            .alpha(0.5)
            .toString()}
        >
          <Columns sum={1} gutter="0.5rem">
            <Box width="2.75rem" height="2.75rem">
              <ChainImageFallback alt="chain-image" src={undefined} />
            </Box>

            <Stack gutter="0.25rem">
              <H3>Persistence</H3>
              <Body2 color={ColorPalette["gray-200"]}>ATOM</Body2>
            </Stack>
          </Columns>
        </Box>

        <Gutter size="1.5rem" />

        <Styles.PathItemList>
          <PathItem isSelected={true} />
          <PathItem />
        </Styles.PathItemList>

        <Gutter size="3rem" />

        <Box width="22.5rem" marginX="auto">
          <Button text="Import" size="large" />
        </Box>
      </YAxis>
    </RegisterSceneBox>
  );
});

const PathItem: FunctionComponent<{ isSelected?: boolean }> = ({
  isSelected = false,
}) => {
  return (
    <Styles.ItemContainer isSelected={isSelected}>
      <Stack gutter="1rem">
        <Columns sum={1} alignY="center" gutter="1rem">
          <Box padding="0.5rem" style={{ color: ColorPalette["gray-10"] }}>
            <WalletIcon width="1.25rem" height="1.25rem" />
          </Box>

          <Stack gutter="0.25rem">
            <H5>m/44’/529’</H5>
            <Body2 color={ColorPalette["gray-200"]}>secret16crw..e3rxsg</Body2>
          </Stack>
        </Columns>

        <Box style={{ border: `1px solid ${ColorPalette["gray-400"]}` }} />

        <Columns sum={1}>
          <Stack gutter="0.25rem">
            <Subtitle3 color={ColorPalette["gray-50"]}>Balance</Subtitle3>
            <Subtitle3 color={ColorPalette["gray-50"]}>Previous txs</Subtitle3>
          </Stack>

          <Column weight={1}>
            <Stack gutter="0.25rem" alignX="right">
              <Subtitle3 color={ColorPalette["gray-50"]}>3542 ATOM</Subtitle3>
              <Subtitle3 color={ColorPalette["gray-50"]}>45</Subtitle3>
            </Stack>
          </Column>
        </Columns>
      </Stack>
    </Styles.ItemContainer>
  );
};
