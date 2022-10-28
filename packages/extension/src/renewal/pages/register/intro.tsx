import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import styled from "styled-components";
import { useStore } from "../../../stores";
import { Box } from "../../components/box";
import { Button } from "../../components/button";
import { Gutter } from "../../components/gutter";
import { Stack } from "../../components/stack";
import { ColorPalette } from "../../styles";
import { CreateAccountType } from "./create-account";

const KeplrLogo = styled.img`
  width: 106px;
  height: 106px;
`;

const KeplrLogoText = styled.img`
  width: 185px;
  height: 106px;
`;

const KeplrDescription = styled.span`
  font-weight: 400;
  font-size: 24px;
  line-height: 36px;
  /* identical to box height */

  text-align: center;
  letter-spacing: 1.17557px;
`;

const TorusText = styled.span`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: ${ColorPalette["platinum-200"]};
  text-align: center;
`;

type RegisterIntroType = "create-account" | "import-account";

export const RegisterIntro: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const { uiConfigStore } = useStore();
  const [registerIntroType, setRegisterIntroType] = useState<
    RegisterIntroType | undefined
  >();

  return (
    <Stack gutter="1rem" flex={2}>
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
        <KeplrLogoText
          src={require("../../../public/assets/brand-text-fit-logo-height.png")}
          alt="logo"
        />
      </Box>
      <Gutter size="1.25rem" />
      <KeplrDescription>Wallet for the Interchain</KeplrDescription>
      <Gutter size="4.875rem" />
      {registerIntroType === undefined ? (
        <Stack gutter="1rem">
          <Button
            color="primary"
            onClick={() => setRegisterIntroType("create-account")}
          >
            Create new account
          </Button>
          <Gutter size="1.25rem" />
          <Button
            color="secondary"
            onClick={() => setRegisterIntroType("import-account")}
          >
            Import existing account
          </Button>
          {
            // Currently, there is no way to use ledger with keplr on firefox.
            // Temporarily, hide the ledger usage.
            uiConfigStore.platform !== "firefox" && (
              <Button
                color="transparent"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                Import ledger
              </Button>
            )
          }
        </Stack>
      ) : registerIntroType === "create-account" ? (
        <Stack gutter="2rem">
          <Stack gutter="0.5rem">
            <Button color="secondary" onClick={() => {}}>
              Sign up with google
            </Button>
            <TorusText>Powered by Torus</TorusText>
          </Stack>
          <Button
            color="primary"
            onClick={(e) => {
              e.preventDefault();
              registerConfig.setType(CreateAccountType);
            }}
          >
            Create new mnemonic
          </Button>
        </Stack>
      ) : (
        <Stack gutter="2rem">
          <Stack gutter="0.5rem">
            <Button color="secondary" onClick={() => {}}>
              Sign up with google
            </Button>
            <TorusText>Powered by Torus</TorusText>
          </Stack>
          <Button color="primary" onClick={() => {}}>
            Import existing account
          </Button>
        </Stack>
      )}
    </Stack>
  );
});
