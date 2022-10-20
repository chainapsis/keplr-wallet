import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { useStore } from "../../../stores";
import { Box } from "../../components/box";
import { Button } from "../../components/button";
import { Card } from "../../components/card";
import { Gutter } from "../../components/gutter";
import { Stack } from "../../components/stack";
import { ColorPalette } from "../../styles";

const Container = styled.div`
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(90deg, #fbf8ff 0%, #f7f8ff 100%);
`;

const KeplrLogo = styled.img`
  width: 106px;
  height: 106px;
`;

const KeplrText = styled.img`
  width: 185px;
  height: 106px;
`;

const Intro = styled.span`
  font-weight: 400;
  font-size: 24px;
  line-height: 36px;
  /* identical to box height */

  text-align: center;
  letter-spacing: 1.17557px;
`;

const Notice = styled.span`
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;
  color: ${ColorPalette["platinum-200"]};
`;

export const RegisterPage: FunctionComponent = observer(() => {
  const { uiConfigStore } = useStore();

  return (
    <Container>
      <Card
        width="100%"
        maxWidth="34.25rem"
        minHeight="12.5rem"
        display="flex"
        flexDirection="vertical"
        background="white"
        padding="4.625rem"
      >
        <Stack gutter="1rem" flex={2}>
          <Gutter size="1rem" />
          <Box display="flex" flexDirection="row" justifyContent="center">
            <KeplrLogo
              src={
                uiConfigStore.isBeta
                  ? require("../../../public/assets/logo-beta-256.png")
                  : require("../../../public/assets/logo-256.png")
              }
              alt="logo"
            />
            <Gutter size="1.5rem" />
            <KeplrText
              src={require("../../../public/assets/brand-text-fit-logo-height.png")}
              alt="logo"
            />
          </Box>
          <Gutter size="1.25rem" />
          <Intro>Wallet for the Interchain</Intro>
          <Gutter size="4.875rem" />
          <Button color="primary">Create new seed</Button>
          <Gutter size="1.25rem" />
          <Button color="secondary">Import Existing Account</Button>
          <Button color="transparent">Import Ledger Nano X</Button>
        </Stack>
      </Card>
      <Gutter size="2.5rem" />
      <Notice>
        All sensitive information is stored only on your device.
        <br />
        This process does not require an internet conenction.
      </Notice>
    </Container>
  );
});
