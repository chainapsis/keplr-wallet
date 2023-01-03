import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../styles";
import { Card } from "../../components/card";
import { SceneTransition } from "../../components/transition";
import { Button } from "../../components/button";

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

const RegisterCard = styled(Card)`
  padding: 3.125rem 5rem;
  background-color: ${ColorPalette["white"]};
  border-radius: 1rem;
  border: 1px solid ${ColorPalette["gray-50"]};

  max-width: 34.25rem;
  width: 100%;
`;

const NoticeText = styled.span`
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.375;
  color: ${ColorPalette["platinum-200"]};
`;

export const RegisterPage: FunctionComponent = observer(() => {
  return (
    <Container>
      <RegisterCard>
        <SceneTransition
          scenes={[
            {
              name: "test",
              element: Button,
            },
          ]}
          initialSceneProps={{
            name: "test",
          }}
        />
      </RegisterCard>
      <NoticeText>
        All sensitive information is stored only on your device.
        <br />
        This process does not require an internet conenction.
      </NoticeText>
    </Container>
  );
});
