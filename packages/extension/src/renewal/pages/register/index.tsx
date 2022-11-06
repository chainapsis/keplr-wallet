import { useRegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { useStore } from "../../../stores";
import { Card } from "../../components/card";
import { Gutter } from "../../components/gutter";
import { ColorPalette } from "../../styles";
import { CreateAccount, CreateAccountType } from "./create-account";
import { RegisterIntro } from "./intro";

const Container = styled.div`
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(90deg, #fbf8ff 0%, #f7f8ff 100%);

  position: relative;
`;

const Notice = styled.span`
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;
  color: ${ColorPalette["platinum-200"]};
`;

export const RegisterPage: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const registerConfig = useRegisterConfig(keyRingStore, []);

  return (
    <Container>
      <Card
        width="100%"
        maxWidth={registerConfig.isIntro ? "34.25rem" : "35rem"}
        height="100%"
        maxHeight={registerConfig.isIntro ? "38.75rem" : "100vh"}
        display="flex"
        flexDirection="vertical"
        background="white"
        padding="4.625rem"
      >
        {registerConfig.isIntro && (
          <RegisterIntro registerConfig={registerConfig} />
        )}
        {registerConfig.type === CreateAccountType && (
          <CreateAccount registerConfig={registerConfig} />
        )}
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
