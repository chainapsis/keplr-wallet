import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../styles";
import { Card } from "../../components/card";
import { SceneTransition } from "../../components/transition";
import { RegisterIntroScene } from "./intro";
import { NewMnemonicScene } from "./new-mnemonic";

const Container = styled.div`
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(90deg, #fbf8ff 0%, #f7f8ff 100%);
`;

const NoticeText = styled.span`
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.375;
  letter-spacing: -0.1px;
  color: ${ColorPalette["platinum-200"]};

  margin-top: 2.125rem;
`;

export const RegisterPage: FunctionComponent = observer(() => {
  return (
    <Container>
      <Card width="100%" maxWidth="34.25rem">
        <SceneTransition
          scenes={[
            {
              name: "intro",
              element: RegisterIntroScene,
            },
            {
              name: "new-mnemonic",
              element: NewMnemonicScene,
            },
          ]}
          initialSceneProps={{
            name: "intro",
          }}
          transitionAlign="center"
        />
      </Card>
      <NoticeText>
        All sensitive information is stored only on your device.
        <br />
        This process does not require an internet conenction.
      </NoticeText>
    </Container>
  );
});
