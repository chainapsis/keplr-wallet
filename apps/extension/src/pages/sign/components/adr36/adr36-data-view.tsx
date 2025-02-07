import React, { FunctionComponent, useState, MouseEvent } from "react";
import { ColorPalette } from "../../../../styles";
import { Box } from "../../../../components/box";
import { useTheme, DefaultTheme } from "styled-components";
import { XAxis } from "../../../../components/axis";
import { Subtitle4 } from "../../../../components/typography";
import { FormattedMessage } from "react-intl";
import {
  ArrowDropDownIcon,
  InformationPlainIcon,
  MessageIcon,
} from "../../../../components/icon";
import { Gutter } from "../../../../components/gutter";

interface Adr36DataViewProps {
  message?: string;
  rawMessage?: string;
}

export const Adr36DataView: FunctionComponent<Adr36DataViewProps> = ({
  message,
  rawMessage,
}) => {
  if (message && rawMessage) {
    return (
      <React.Fragment>
        <Adr36DataSection
          content={message}
          isRawMessageStyle={false}
          canToggle={false}
        />
        <Gutter size="0.725rem" />
        <Adr36DataSection
          content={rawMessage}
          isRawMessageStyle={true}
          canToggle={true}
        />
      </React.Fragment>
    );
  }

  if (message) {
    return (
      <Adr36DataSection
        content={message}
        isRawMessageStyle={false}
        canToggle={false}
      />
    );
  }

  if (rawMessage) {
    return (
      <Adr36DataSection
        content={rawMessage}
        isRawMessageStyle={true}
        canToggle={false}
      />
    );
  }
  return null;
};

interface Adr36DataSectionProps {
  content?: string;
  isRawMessageStyle: boolean;
  canToggle: boolean;
}

const Adr36DataSection: FunctionComponent<Adr36DataSectionProps> = ({
  content,
  isRawMessageStyle,
  canToggle,
}) => {
  const theme: DefaultTheme = useTheme();
  const [expanded, setExpanded] = useState<boolean>(!canToggle);

  const containerStyle: React.CSSProperties = {
    overflow: "auto",
    boxShadow:
      theme.mode === "light"
        ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
        : "none",
    ...(!isRawMessageStyle && !canToggle ? { maxHeight: "8rem" } : {}),
  };

  // pre 태그 스타일을 인라인으로 정의 (raw 스타일 여부에 따라 폰트 크기 및 색상 변경)
  const preStyle: React.CSSProperties = {
    margin: 0,
    fontWeight: 400,
    fontSize: isRawMessageStyle ? "0.875rem" : "1rem",
    ...(isRawMessageStyle
      ? { color: ColorPalette["gray-200"] }
      : {
          color:
            theme.mode === "light"
              ? ColorPalette["gray-500"]
              : ColorPalette["white"],
          overflowWrap: "anywhere",
          whiteSpace: "break-spaces",
        }),
  };

  const handleToggle = (e: MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setExpanded((prev: boolean) => !prev);
  };

  return (
    <Box
      padding="1rem"
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
      borderRadius="0.375rem"
      style={containerStyle}
    >
      {canToggle ? <AdvancedTitle onClick={handleToggle} /> : <MessageTitle />}
      <Box>
        {(!canToggle || (canToggle && expanded)) && (
          <React.Fragment>
            <Gutter size={isRawMessageStyle ? "1rem" : "0.5rem"} />
            <pre style={preStyle}>{content}</pre>
          </React.Fragment>
        )}
      </Box>
    </Box>
  );
};

const MessageTitle: FunctionComponent = () => {
  const theme: DefaultTheme = useTheme();
  return (
    <Box
      style={{
        color:
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-100"],
      }}
    >
      <XAxis alignY="center">
        <MessageIcon
          width="1rem"
          height="1rem"
          color={
            theme.mode === "light"
              ? ColorPalette["gray-200"]
              : ColorPalette["gray-300"]
          }
        />
        <Gutter size="0.375rem" />
        <Subtitle4>Message</Subtitle4>
      </XAxis>
    </Box>
  );
};

const AdvancedTitle = ({
  onClick,
}: {
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
}) => {
  const theme: DefaultTheme = useTheme();
  return (
    <Box
      cursor="pointer"
      onClick={onClick}
      paddingY="0.5rem"
      style={{
        color:
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-100"],
      }}
    >
      <XAxis alignY="center">
        <InformationPlainIcon
          width="1rem"
          height="1rem"
          color={
            theme.mode === "light"
              ? ColorPalette["gray-200"]
              : ColorPalette["gray-300"]
          }
        />
        <Gutter size="0.375rem" />
        <Subtitle4>
          <FormattedMessage id="page.sign.cosmos.tx.view-data-button" />
        </Subtitle4>
        <div style={{ flex: 1 }} />
        <ArrowDropDownIcon
          width="1rem"
          height="1rem"
          color={ColorPalette["gray-300"]}
        />
      </XAxis>
    </Box>
  );
};
