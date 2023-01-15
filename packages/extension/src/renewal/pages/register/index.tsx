import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../styles";
import { Card } from "../../components/card";
import {
  SceneTransition,
  SceneTransitionRef,
} from "../../components/transition";
import { RegisterIntroScene } from "./intro";
import { NewMnemonicScene } from "./new-mnemonic";
import { Gutter } from "../../components/gutter";
import { VerticalCollapseTransition } from "../../components/transition/vertical-collapse";
import { Box } from "../../components/box";

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
`;

export const RegisterPage: FunctionComponent = observer(() => {
  const sceneRef = useRef<SceneTransitionRef | null>(null);

  const [bottomIntroCollapsed, setBottomIntroCollpased] = useState(false);

  useEffect(() => {
    const onSceneChanged = (stack: ReadonlyArray<string>) => {
      if (stack.length === 0) {
        throw new Error("Can't happen");
      }

      setBottomIntroCollpased(stack[stack.length - 1] !== "intro");
    };

    if (sceneRef.current) {
      const scene = sceneRef.current;

      scene.addSceneChangeListener(onSceneChanged);
      return () => {
        scene.removeSceneChangeListener(onSceneChanged);
      };
    }
  }, []);

  return (
    <Container>
      <Box width="100%" maxWidth="34.25rem">
        <Card>
          <SceneTransition
            ref={sceneRef}
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
        <BottomIntro collapsed={bottomIntroCollapsed} />
      </Box>
    </Container>
  );
});

const BottomIntro: FunctionComponent<{
  collapsed: boolean;
}> = ({ collapsed }) => {
  return (
    <Box position="relative">
      <Box position="absolute" style={{ left: 0, right: 0 }}>
        <VerticalCollapseTransition collapsed={collapsed}>
          <Gutter size="1.625rem" />
        </VerticalCollapseTransition>
        <VerticalCollapseTransition
          collapsed={collapsed}
          transitionAlign="bottom"
        >
          <Gutter size="0.5rem" />
          <Box alignX="center">
            <NoticeText>
              All sensitive information is stored only on your device.
              <br />
              This process does not require an internet conenction.
            </NoticeText>
          </Box>
        </VerticalCollapseTransition>
      </Box>
    </Box>
  );
};
