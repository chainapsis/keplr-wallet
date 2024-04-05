import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { useTheme } from "styled-components";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Body2, H5 } from "../../../../components/typography";
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

export type UpdateNotePageData = {
  title: string;
  image:
    | {
        default: string;
        light: string;
        aspectRatio: string;
      }
    | undefined;
  paragraph: string;
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
        maxWidth="18.75rem"
        paddingTop="1.5rem"
        paddingBottom="1.25rem"
        paddingX={updateNotePageData.length > 1 ? "1.75rem" : "1.25rem"}
        borderRadius="0.5rem"
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["white"]
            : ColorPalette["gray-600"]
        }
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
          <Box alignX="center">
            <Body2 color={ColorPalette["gray-300"]}>
              {currentPage + 1} / {updateNotePageData.length}
            </Body2>
          </Box>
        ) : null}

        <Gutter size="1.125rem" />

        <Button
          text={intl.formatMessage({
            id: "button.close",
          })}
          size="medium"
          color="secondary"
          onClick={close}
        />

        {currentPage > 0 ? (
          <Box
            position="absolute"
            alignY="center"
            paddingLeft="0.25rem"
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
            paddingRight="0.25rem"
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
}> = ({ notePageData }) => {
  const theme = useTheme();

  return (
    <Box>
      <Box alignX="center">
        <H5
          color={
            theme.mode === "light"
              ? ColorPalette["black"]
              : ColorPalette["white"]
          }
        >
          <FormattedMessage
            id="update-node/paragraph/noop"
            defaultMessage={notePageData.title}
            values={{
              br: <br />,
            }}
          />
        </H5>
      </Box>

      <Gutter size="1.25rem" />

      {notePageData.image ? (
        <CompImage
          alt={notePageData.title}
          src={
            theme.mode === "light"
              ? notePageData.image.light
              : notePageData.image.default
          }
          style={{
            aspectRatio: notePageData.image.aspectRatio,
            width: "100%",
            padding: "0.25rem",
            marginBottom: "1.5rem",
          }}
        />
      ) : null}
      <Box>
        <Body2
          color={
            theme.mode === "light"
              ? ColorPalette["gray-400"]
              : ColorPalette["gray-100"]
          }
        >
          <FormattedMessage
            id="update-node/paragraph/noop"
            defaultMessage={notePageData.paragraph}
            values={{
              br: <br />,
            }}
          />
        </Body2>
      </Box>
    </Box>
  );
};
