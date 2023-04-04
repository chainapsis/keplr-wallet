import React, {
  FunctionComponent,
  MutableRefObject,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  SceneTransition,
  SceneTransitionRef,
  VerticalResizeTransition,
} from "../../../../components/transition";
import { Box } from "../../../../components/box";
import { YAxis } from "../../../../components/axis";
import { Body1, H1, H3, Subtitle3 } from "../../../../components/typography";
import { useRegisterHeader } from "./context";
import { Gutter } from "../../../../components/gutter";
import { ColorPalette } from "../../../../styles";

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
              paragraphs: header.paragraphs,
              stepCurrent: header.stepCurrent,
              stepTotal: header.stepTotal,
            });
          } else {
            headerSceneRef.current.setCurrentSceneProps({
              sceneRef,
              title: header.title,
              paragraphs: header.paragraphs,
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
            top: "-0.5rem",
            left: "0.5rem",
            zIndex: 1000,
          }}
        >
          <BackButton sceneRef={sceneRef} />
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
  paragraphs?: (string | ReactNode)[];
  stepCurrent: number;
  stepTotal: number;
}> = ({ title, paragraphs, stepCurrent, stepTotal }) => {
  return (
    <Box position="relative">
      <YAxis alignX="center">
        <Subtitle3>{`Step ${stepCurrent}/${stepTotal}`}</Subtitle3>
        <Gutter size="0.75rem" />
        <H3>{title}</H3>
      </YAxis>
      <VerticalResizeTransition>
        {paragraphs && paragraphs.length > 0 ? <Gutter size="1.25rem" /> : null}
      </VerticalResizeTransition>
      <VerticalResizeTransition transitionAlign="top">
        {(() => {
          if (paragraphs && paragraphs.length > 0) {
            if (paragraphs.length === 1) {
              return (
                <Body1
                  style={{
                    textAlign: "center",
                  }}
                >
                  {paragraphs[0]}
                </Body1>
              );
            }

            return (
              <YAxis alignX="center">
                <ul>
                  {paragraphs.map((paragraph, i) => {
                    return (
                      <Body1 key={i} as="li">
                        {paragraph}
                      </Body1>
                    );
                  })}
                </ul>
              </YAxis>
            );
          }

          return null;
        })()}
      </VerticalResizeTransition>
    </Box>
  );
};

const BackButton: FunctionComponent<{
  sceneRef: MutableRefObject<SceneTransitionRef | null>;
}> = ({ sceneRef }) => {
  return (
    <div
      style={{
        width: "2.5rem",
        height: "2.5rem",
        backgroundColor: ColorPalette["gray-500"],
        borderRadius: "100000px",
        cursor: "pointer",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        e.preventDefault();

        if (sceneRef.current && sceneRef.current.stack.length > 1) {
          sceneRef.current.pop();
        }
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1.5rem"
        height="1.5rem"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke={ColorPalette["gray-200"]}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
        />
      </svg>
    </div>
  );
};
