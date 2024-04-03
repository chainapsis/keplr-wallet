import React, { FunctionComponent, useRef, useState } from "react";
import { useTheme } from "styled-components";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Body2, Subtitle1 } from "../../../../components/typography";
import { Button } from "../../../../components/button";
import { YAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";
import { ArrowLeftIcon, ArrowRightIcon } from "../../../../components/icon";
import {
  FixedWidthSceneTransition,
  SceneTransitionRef,
} from "../../../../components/transition";
import { Image } from "../../../../components/image";
import { FormattedMessage, useIntl } from "react-intl";

export type UpdateNotePageData = {
  imageSrc?: string;
  paragraphs: string[];
};

export const UpdateNoteModal: FunctionComponent<{
  close: () => void;
  updateNotePageData: UpdateNotePageData[];
}> = ({ close, updateNotePageData }) => {
  const intl = useIntl();
  const theme = useTheme();

  const [currentPage, setCurrentPage] = useState(0);
  const sceneRef = useRef<SceneTransitionRef | null>(null);

  const onClickNext = () => {
    if (sceneRef.current && currentPage < updateNotePageData.length - 1) {
      sceneRef.current.push(`page-${currentPage + 1}`);
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

  return (
    <YAxis alignX="center">
      <Box
        position="relative"
        width="18.5rem"
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
        <Box alignX={updateNotePageData.length > 1 ? "center" : "left"}>
          <Subtitle1
            color={
              theme.mode === "light"
                ? ColorPalette["black"]
                : ColorPalette["white"]
            }
          >
            <FormattedMessage id="page.main.components.update-note-modal.title" />
          </Subtitle1>
        </Box>

        <Gutter size="1.25rem" />

        <FixedWidthSceneTransition
          ref={sceneRef}
          transitionAlign="center"
          initialSceneProps={{ name: `page-${currentPage}` }}
          scenes={updateNotePageData.map((notePageData, index) => {
            return {
              name: `page-${index}`,
              element: () => <CarouselPage notePageData={notePageData} />,
              width: "100%",
            };
          })}
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
    <Box style={{ flex: "none" }}>
      {notePageData.imageSrc ? (
        <Image
          alt={notePageData.imageSrc}
          src={notePageData.imageSrc}
          style={{ aspectRatio: "2.2/1", width: "100%" }}
        />
      ) : null}
      <ul style={{ paddingLeft: "1rem" }}>
        {notePageData.paragraphs.map((paragraph, index) => {
          return (
            <React.Fragment key={index}>
              <li
                style={{
                  overflow: "visible",
                  flex: 1,
                  color:
                    theme.mode === "light"
                      ? ColorPalette["gray-400"]
                      : ColorPalette["gray-100"],
                }}
              >
                <Body2>{paragraph}</Body2>
              </li>

              <Gutter size="0.625rem" />
            </React.Fragment>
          );
        })}
      </ul>
    </Box>
  );
};
