import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { useTheme } from "styled-components";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { BaseTypography, Body2 } from "../../../../components/typography";
import { Button } from "../../../../components/button";
import { YAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";
import { ArrowLeftIcon, ArrowRightIcon } from "../../../../components/icon";
import {
  FixedWidthSceneTransition,
  SceneTransitionRef,
} from "../../../../components/transition";
import { Image as CompImage } from "../../../../components/image";
import { FormattedMessage, useIntl } from "react-intl";
import SimpleBar from "simplebar-react";
import { observer } from "mobx-react-lite";
import { ParagraphWithLinks } from "./paragraph-with-links";

export type UpdateNotePageData = {
  title: string;
  subtitle?: string;
  image:
    | {
        default: string;
        light: string;
        aspectRatio: string;
      }
    | undefined;
  paragraph: string;
  links?: {
    [key: string]: string;
  };
  closeText?: string;
  closeLink?: string;
};

export const UpdateNoteModal: FunctionComponent<{
  close: () => void;
  updateNotePageData: UpdateNotePageData[];
}> = ({ close, updateNotePageData }) => {
  const intl = useIntl();
  const theme = useTheme();

  const [currentPage, setCurrentPage] = useState(0);
  const sceneRef = useRef<SceneTransitionRef | null>(null);

  const imagePreloaded = useRef<Map<string, boolean>>(new Map());
  useEffect(() => {
    // 다음 scene에서 image가 바로 보이도록 미리 preload한다.
    for (const u of updateNotePageData) {
      if (u.image) {
        const src = theme.mode === "light" ? u.image.light : u.image.default;
        if (!imagePreloaded.current.get(src)) {
          imagePreloaded.current.set(src, true);
          const img = new Image();
          img.src = src;
        }
      }
    }
  }, [updateNotePageData, theme.mode]);

  const onClickNext = () => {
    if (sceneRef.current && currentPage < updateNotePageData.length - 1) {
      sceneRef.current.push("page", {
        notePageData: updateNotePageData[currentPage + 1],
      });
      setCurrentPage(currentPage + 1);
    }
  };

  const onClickPrev = () => {
    if (currentPage === 0) {
      return;
    } else {
      if (sceneRef.current) {
        sceneRef.current.pop();
        setCurrentPage(currentPage - 1);
      }
    }
  };

  if (updateNotePageData.length === 0) {
    return null;
  }

  return (
    <YAxis alignX="center">
      <Box
        position="relative"
        width="95%"
        maxWidth="20rem"
        borderRadius="0.75rem"
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["white"]
            : ColorPalette["gray-600"]
        }
        style={{
          overflow: "hidden",
        }}
      >
        <FixedWidthSceneTransition
          ref={sceneRef}
          transitionAlign="center"
          initialSceneProps={{
            name: "page",
            props: { notePageData: updateNotePageData[0] },
          }}
          scenes={[
            {
              name: "page",
              element: CarouselPage,
              width: "100%",
            },
          ]}
        />

        {updateNotePageData.length > 1 ? (
          <Box alignX="center" marginTop="0.5rem">
            <Body2 color={ColorPalette["gray-300"]}>
              {currentPage + 1} / {updateNotePageData.length}
            </Body2>
          </Box>
        ) : null}

        <Gutter size="1.5rem" />

        <Box marginX="1.25rem" marginBottom="1.25rem">
          <Button
            text={(() => {
              const current = updateNotePageData[currentPage];

              if (current && current.closeText) {
                return current.closeText;
              }

              return intl.formatMessage({
                id: "button.close",
              });
            })()}
            size="medium"
            color="secondary"
            onClick={() => {
              const current = updateNotePageData[currentPage];

              if (current && current.closeLink) {
                browser.tabs.create({
                  url: current.closeLink,
                });
              }
              close();
            }}
          />
        </Box>

        <Box position="absolute" alignY="center" style={{ top: 0, right: 0 }}>
          <Box
            width="2rem"
            height="2rem"
            marginTop="0.75rem"
            marginRight="0.75rem"
            alignX="center"
            alignY="center"
            cursor="pointer"
            opacity={0.5}
            onClick={(e) => {
              e.preventDefault();

              close();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="none"
              viewBox="0 0 24 24"
            >
              <path
                fill={
                  theme.mode === "light"
                    ? ColorPalette["black"]
                    : ColorPalette["white"]
                }
                d="M7.536 6.264a.9.9 0 0 0-1.272 1.272L10.727 12l-4.463 4.464a.9.9 0 0 0 1.272 1.272L12 13.273l4.464 4.463a.9.9 0 1 0 1.272-1.272L13.273 12l4.463-4.464a.9.9 0 1 0-1.272-1.272L12 10.727z"
              />
            </svg>
          </Box>
        </Box>

        {currentPage > 0 ? (
          <Box
            position="absolute"
            alignY="center"
            style={{ top: 0, bottom: 0, left: 0 }}
          >
            <Box
              height="3.875rem"
              borderRadius="0.375rem"
              alignY="center"
              hover={{
                backgroundColor:
                  theme.mode === "light"
                    ? ColorPalette["gray-50"]
                    : ColorPalette["gray-500"],
              }}
              onClick={onClickPrev}
              cursor="pointer"
            >
              <ArrowLeftIcon
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-300"]
                }
              />
            </Box>
          </Box>
        ) : null}

        {currentPage < updateNotePageData.length - 1 ? (
          <Box
            position="absolute"
            alignY="center"
            style={{ top: 0, bottom: 0, right: 0 }}
          >
            <Box
              height="3.875rem"
              borderRadius="0.375rem"
              alignY="center"
              hover={{
                backgroundColor:
                  theme.mode === "light"
                    ? ColorPalette["gray-50"]
                    : ColorPalette["gray-500"],
              }}
              onClick={onClickNext}
              cursor="pointer"
            >
              <ArrowRightIcon
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-300"]
                }
              />
            </Box>
          </Box>
        ) : null}
      </Box>
    </YAxis>
  );
};

const CarouselPage: FunctionComponent<{
  notePageData: UpdateNotePageData;
}> = observer(({ notePageData }) => {
  const theme = useTheme();

  return (
    <SimpleBar
      style={{
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        maxHeight: "26rem",
      }}
    >
      {notePageData.image ? (
        <CompImage
          alt={notePageData.title}
          src={(() => {
            if (theme.mode === "light") {
              if (notePageData.image.light.endsWith("ext_btc-light.gif")) {
                return require("../../../../public/assets/img/ext_btc-light.gif");
              }
            }
            if (notePageData.image.default.endsWith("ext_btc-dark.gif")) {
              return require("../../../../public/assets/img/ext_btc-dark.gif");
            }

            return theme.mode === "light"
              ? notePageData.image.light
              : notePageData.image.default;
          })()}
          style={{
            aspectRatio: notePageData.image.aspectRatio,
            width: "100%",
          }}
        />
      ) : null}

      <Box
        alignX="center"
        marginX="1.25rem"
        marginTop={notePageData.image ? "" : "1.25rem"}
      >
        <BaseTypography
          color={
            theme.mode === "light"
              ? ColorPalette["black"]
              : ColorPalette["white"]
          }
          style={{
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          <FormattedMessage
            id="update-node/paragraph/noop"
            defaultMessage={notePageData.title}
            values={{
              br: <br />,
              b: (...chunks: any) => <b>{chunks}</b>,
              gutter: <Gutter size="0.625rem" />,
            }}
          />
        </BaseTypography>
      </Box>

      {notePageData.subtitle ? (
        <React.Fragment>
          <Gutter size="0.75rem" />
          <Box alignX="center" marginX="1.25rem">
            <BaseTypography
              color={
                theme.mode === "light"
                  ? ColorPalette["black"]
                  : ColorPalette["white"]
              }
              style={{
                fontWeight: 400,
                fontSize: "0.75rem",
                lineHeight: "155%",
              }}
            >
              <FormattedMessage
                id="update-node/paragraph/noop"
                defaultMessage={notePageData.subtitle}
                values={{
                  br: <br />,
                  b: (...chunks: any) => (
                    <b style={{ fontWeight: 700 }}>{chunks}</b>
                  ),
                  gutter: <Gutter size="0.625rem" />,
                }}
              />
            </BaseTypography>
          </Box>
          <Gutter size="1.5rem" />
        </React.Fragment>
      ) : (
        <Gutter size="1.5rem" />
      )}

      <Box marginX="1.25rem">
        <BaseTypography
          color={
            theme.mode === "light"
              ? ColorPalette["black"]
              : ColorPalette["white"]
          }
          style={{
            fontWeight: 400,
            fontSize: "0.75rem",
            lineHeight: "155%",
          }}
        >
          <ParagraphWithLinks
            paragraph={notePageData.paragraph}
            links={notePageData.links}
          />
        </BaseTypography>
      </Box>
    </SimpleBar>
  );
});
