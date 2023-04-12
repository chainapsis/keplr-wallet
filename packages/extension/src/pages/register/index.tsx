import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useRef } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../styles";
import {
  FixedWidthSceneTransition,
  SceneTransitionRef,
} from "../../components/transition";
import { RegisterIntroScene } from "./intro";
import { NewMnemonicScene } from "./new-mnemonic";
import { Box } from "../../components/box";
import { VerifyMnemonicScene } from "./verify-mnemonic";
import { RecoverMnemonicScene } from "./recover-mnemonic";
import { RegisterIntroNewUserScene } from "./intro-new-user";
import {
  RegisterHeader,
  RegisterHeaderProvider,
  useRegisterHeaderContext,
} from "./components/header";
import { RegisterIntroExistingUserScene } from "./intro-existing-user";
import { RegisterNamePasswordScene } from "./name-password";
import { ConnectHardwareWalletScene } from "./connect-hardware";
import { ConnectLedgerScene } from "./connect-ledger";
import { RegisterNamePasswordHardwareScene } from "./name-password-hardware";
import { FinalizeKeyScene } from "./finalize-key";
import { EnableChainsScene } from "./enable-chains";

const Container = styled.div`
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const RegisterPage: FunctionComponent = observer(() => {
  const sceneRef = useRef<SceneTransitionRef | null>(null);

  const headerContext = useRegisterHeaderContext({
    mode: "intro",
  });

  return (
    <Container>
      <RegisterHeaderProvider {...headerContext}>
        <RegisterHeader sceneRef={sceneRef} />
        <Box
          position="relative"
          marginX="auto"
          backgroundColor={ColorPalette["gray-600"]}
          borderRadius="1.5rem"
        >
          <FixedWidthSceneTransition
            ref={sceneRef}
            scenes={[
              {
                name: "intro",
                element: RegisterIntroScene,
                width: "31rem",
              },
              {
                name: "new-user",
                element: RegisterIntroNewUserScene,
                width: "47.8rem",
              },
              {
                name: "existing-user",
                element: RegisterIntroExistingUserScene,
                width: "47.8rem",
              },
              {
                name: "new-mnemonic",
                element: NewMnemonicScene,
                width: "33.75rem",
              },
              {
                name: "verify-mnemonic",
                element: VerifyMnemonicScene,
                width: "35rem",
              },
              {
                name: "recover-mnemonic",
                element: RecoverMnemonicScene,
                width: "33.75rem",
              },
              {
                name: "connect-hardware-wallet",
                element: ConnectHardwareWalletScene,
                width: "31rem",
              },
              {
                name: "connect-ledger",
                element: ConnectLedgerScene,
                width: "40rem",
              },
              {
                name: "name-password",
                element: RegisterNamePasswordScene,
                width: "29rem",
              },
              {
                name: "name-password-hardware",
                element: RegisterNamePasswordHardwareScene,
                width: "29rem",
              },
              {
                name: "finalize-key",
                element: FinalizeKeyScene,
                width: "17.5rem",
              },
              {
                name: "enable-chains",
                element: EnableChainsScene,
                width: "34.5rem",
              },
            ]}
            initialSceneProps={{
              name: "intro",
            }}
            transitionAlign="center"
          />
        </Box>
      </RegisterHeaderProvider>
    </Container>
  );
});
