import React, {
  FunctionComponent,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  SceneTransition,
  SceneTransitionRef,
} from "../../../../components/transition";
import { Box } from "../../../../components/box";
import { YAxis } from "../../../../components/axis";
import { H1, H3, Subtitle3 } from "../../../../components/typography";
import { useRegisterHeader } from "./context";
import { Gutter } from "../../../../components/gutter";

export const RegisterHeader: FunctionComponent<{
  sceneRef: MutableRefObject<SceneTransitionRef | null>;
}> = ({ sceneRef }) => {
  const headerSceneRef = useRef<SceneTransitionRef | null>(null);

  const { header } = useRegisterHeader();

  useEffect(() => {
    if (headerSceneRef.current) {
      // TODO: Use `replace` instead of `push`
      switch (header.mode) {
        case "intro": {
          if (headerSceneRef.current.currentScene !== "intro") {
            headerSceneRef.current.replace("intro", {
              sceneRef,
            });
          }
          break;
        }
        case "welcome": {
          if (headerSceneRef.current.currentScene !== "welcome") {
            headerSceneRef.current.replace("welcome", {
              sceneRef,
              isUserBack: header.isUserBack,
            });
          } else {
            headerSceneRef.current.setCurrentSceneProps({
              sceneRef,
              isUserBack: header.isUserBack,
            });
          }
          break;
        }
        case "step": {
          if (headerSceneRef.current.currentScene !== "step") {
            headerSceneRef.current.replace("step", {
              sceneRef,
              title: header.title,
              stepCurrent: header.stepCurrent,
              stepTotal: header.stepTotal,
            });
          } else {
            headerSceneRef.current.setCurrentSceneProps({
              sceneRef,
              title: header.title,
              stepCurrent: header.stepCurrent,
              stepTotal: header.stepTotal,
            });
          }
          break;
        }
      }
    }
  }, [header, sceneRef]);

  const [isBackShown, setIsBackShown] = useState(
    sceneRef.current?.canPop() ?? false
  );

  useEffect(() => {
    const listener = (stack: ReadonlyArray<string>) => {
      setIsBackShown(stack.length > 1);
    };

    const ref = sceneRef.current;
    ref?.addSceneChangeListener(listener);

    return () => {
      ref?.removeSceneChangeListener(listener);
    };
  }, [sceneRef]);

  return (
    <Box
      position="relative"
      marginX="auto"
      width="47.75rem"
      paddingBottom="2rem"
    >
      {isBackShown ? (
        <div
          style={{
            position: "absolute",
            cursor: "pointer",
            top: 0,
            left: "0.5rem",
            zIndex: 1000,
          }}
          onClick={(e) => {
            e.preventDefault();

            if (sceneRef.current && sceneRef.current.stack.length > 1) {
              sceneRef.current.pop();
            }
          }}
        >
          test
        </div>
      ) : null}
      <SceneTransition
        ref={headerSceneRef}
        scenes={[
          {
            name: "intro",
            element: HeaderIntro,
          },
          {
            name: "welcome",
            element: HeaderWelcome,
          },
          {
            name: "step",
            element: HeaderStep,
          },
        ]}
        initialSceneProps={{
          name: "intro",
          props: {
            sceneRef,
          },
        }}
        transitionAlign="center"
        transitionMode="opacity"
      />
    </Box>
  );
};

const HeaderIntro: FunctionComponent<{
  sceneRef: MutableRefObject<SceneTransitionRef | null>;
}> = () => {
  return (
    <Box paddingY="0.25rem">
      <YAxis alignX="center">
        <H1>Your Interchain Gateway</H1>
      </YAxis>
    </Box>
  );
};

const HeaderWelcome: FunctionComponent<{
  sceneRef: MutableRefObject<SceneTransitionRef | null>;
  isUserBack: boolean;
}> = ({ isUserBack }) => {
  return (
    <Box position="relative">
      <YAxis alignX="center">
        <H1>{!isUserBack ? "Welcome to Keplr" : "Welcome Back to Keplr"}</H1>
        <Gutter size="0.75rem" />
        <H3>
          {!isUserBack
            ? "Select the way you want to create your wallet"
            : "Glad you’re back!"}
        </H3>
      </YAxis>
    </Box>
  );
};

const HeaderStep: FunctionComponent<{
  sceneRef: MutableRefObject<SceneTransitionRef | null>;
  title: string;
  stepCurrent: number;
  stepTotal: number;
}> = ({ title, stepCurrent, stepTotal }) => {
  return (
    <Box position="relative">
      <YAxis alignX="center">
        <Subtitle3>{`Step ${stepCurrent}/${stepTotal}`}</Subtitle3>
        <Gutter size="0.75rem" />
        <H3>{title}</H3>
      </YAxis>
    </Box>
  );
};
