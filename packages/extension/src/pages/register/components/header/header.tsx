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
import { Body1, H4, Subtitle3 } from "../../../../components/typography";
import { useRegisterHeader } from "./context";
import { Gutter } from "../../../../components/gutter";
import { ColorPalette } from "../../../../styles";
import { RegisterH1, RegisterH4, RegisterH3 } from "../typography";
import { HelpDeskButton } from "../help-desk-button";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";

export const RegisterHeader: FunctionComponent<{
  sceneRef: MutableRefObject<SceneTransitionRef | null>;
}> = ({ sceneRef }) => {
  const headerSceneRef = useRef<SceneTransitionRef | null>(null);

  const { header } = useRegisterHeader();

  useEffect(() => {
    if (headerSceneRef.current) {
      switch (header.mode) {
        case "intro": {
          if (headerSceneRef.current.currentScene !== "intro") {
            headerSceneRef.current.replace("intro", {});
          }
          break;
        }
        case "empty": {
          if (headerSceneRef.current.currentScene !== "empty") {
            headerSceneRef.current.replace("empty", {});
          }
          break;
        }
        case "welcome": {
          if (headerSceneRef.current.currentScene !== "welcome") {
            headerSceneRef.current.replace("welcome", {
              title: header.title,
              paragraph: header.paragraph,
            });
          } else {
            headerSceneRef.current.setCurrentSceneProps({
              title: header.title,
              paragraph: header.paragraph,
            });
          }
          break;
        }
        case "step": {
          if (headerSceneRef.current.currentScene !== "step") {
            headerSceneRef.current.replace("step", {
              title: header.title,
              paragraphs: header.paragraphs,
              stepCurrent: header.stepCurrent,
              stepTotal: header.stepTotal,
            });
          } else {
            headerSceneRef.current.setCurrentSceneProps({
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
  }, [header]);

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

  const [currentIsEmpty, setCurrentIsEmpty] = useState(false);

  useEffect(() => {
    const listener = (stack: ReadonlyArray<string>) => {
      if (stack.length > 0 && stack[stack.length - 1] === "empty") {
        setCurrentIsEmpty(true);
      } else {
        setCurrentIsEmpty(false);
      }
    };

    const ref = headerSceneRef.current;
    ref?.addSceneChangeListener(listener);

    return () => {
      ref?.removeSceneChangeListener(listener);
    };
  }, []);

  return (
    <Box position="relative" marginX="auto" width="47.75rem">
      {header.mode !== "intro" ? <HelpDeskButton /> : null}
      {isBackShown && !currentIsEmpty ? (
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
            name: "empty",
            element: () => null,
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
        }}
        transitionAlign="center"
        transitionMode="opacity"
      />
      {
        <VerticalResizeTransition>
          {/* bottom padding */}
          {currentIsEmpty ? null : <Gutter size="2rem" />}
        </VerticalResizeTransition>
      }
    </Box>
  );
};

const HeaderIntro: FunctionComponent = () => {
  const theme = useTheme();

  return (
    <Box paddingY="0.25rem">
      <YAxis alignX="center">
        <img
          src={require(theme.mode === "light"
            ? "../../../../public/assets/img/intro-logo-light.png"
            : "../../../../public/assets/img/intro-logo.png")}
          style={{
            height: "3.125rem",
          }}
          alt="intro-hardware-wallet image"
        />

        <Gutter size="1.25rem" />

        <RegisterH4
          color={
            theme.mode === "light"
              ? ColorPalette["gray-200"]
              : ColorPalette["gray-50"]
          }
        >
          <FormattedMessage id="pages.register.components.header.intro-title" />
        </RegisterH4>
      </YAxis>
    </Box>
  );
};

const HeaderWelcome: FunctionComponent<{
  title: string;
  paragraph: string;
}> = ({ title, paragraph }) => {
  const theme = useTheme();

  return (
    <Box position="relative">
      <YAxis alignX="center">
        <RegisterH1>{title}</RegisterH1>
        <Gutter size="0.75rem" />
        <H4
          color={
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"]
          }
        >
          {paragraph}
        </H4>
      </YAxis>
    </Box>
  );
};

const HeaderStep: FunctionComponent<{
  title: string;
  paragraphs?: (string | ReactNode)[];
  stepCurrent: number;
  stepTotal: number;
}> = ({ title, paragraphs, stepCurrent, stepTotal }) => {
  const intl = useIntl();
  const theme = useTheme();
  return (
    <Box position="relative">
      <YAxis alignX="center">
        {stepCurrent <= 0 && stepTotal <= 0 ? null : (
          <React.Fragment>
            <Subtitle3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
            >{`${intl.formatMessage({
              id: "pages.register.components.header.header-step.title",
            })} ${stepCurrent}/${stepTotal}`}</Subtitle3>
            <Gutter size="0.75rem" />
          </React.Fragment>
        )}

        <RegisterH3>{title}</RegisterH3>
      </YAxis>
      <Box width="29.5rem" marginX="auto">
        <VerticalResizeTransition>
          {paragraphs && paragraphs.length > 0 ? (
            <Gutter size="1.25rem" />
          ) : null}
        </VerticalResizeTransition>
        <VerticalResizeTransition transitionAlign="top">
          {(() => {
            if (paragraphs && paragraphs.length > 0) {
              if (paragraphs.length === 1) {
                return (
                  <Body1
                    color={ColorPalette["gray-300"]}
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
                        <Body1
                          key={i}
                          as="li"
                          color={ColorPalette["gray-300"]}
                          style={{ marginTop: i > 0 ? "0.5rem" : "0" }}
                        >
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
    </Box>
  );
};

const BackButton: FunctionComponent<{
  sceneRef: MutableRefObject<SceneTransitionRef | null>;
}> = ({ sceneRef }) => {
  const theme = useTheme();

  return (
    <div
      style={{
        width: "2.5rem",
        height: "2.5rem",
        backgroundColor:
          theme.mode === "light"
            ? ColorPalette["gray-50"]
            : ColorPalette["gray-500"],
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
