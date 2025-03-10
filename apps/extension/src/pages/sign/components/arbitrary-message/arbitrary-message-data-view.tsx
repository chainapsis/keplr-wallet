import React, {
  FunctionComponent,
  useState,
  MouseEvent,
  useLayoutEffect,
  useRef,
} from "react";
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
import SimpleBar from "simplebar-react";
import { isRunningInSidePanel } from "../../../../utils";

interface ArbitraryMsgDataViewProps {
  message?: string;
  rawMessage?: string;
  messageIsShownAsJSON?: boolean;
}
const MAX_HEIGHT = 780;
export const ArbitraryMsgDataView: FunctionComponent<
  ArbitraryMsgDataViewProps
> = ({ message, rawMessage, messageIsShownAsJSON = false }) => {
  const [isMessageExpanded, setIsMessageExpanded] = useState(false);
  const [isRawMessageExpanded, setIsRawMessageExpanded] = useState(false);
  const initialHeight = useRef<number>(0);

  useLayoutEffect(() => {
    initialHeight.current = window.outerHeight;
  }, []);

  useLayoutEffect(() => {
    const anyExpanded = isMessageExpanded || isRawMessageExpanded;
    const targetHeight = anyExpanded ? MAX_HEIGHT : initialHeight.current;

    if (window.outerHeight !== targetHeight) {
      window.resizeTo(window.innerWidth, targetHeight);
    }
  }, [isMessageExpanded, isRawMessageExpanded]);

  if (message && rawMessage) {
    return (
      <React.Fragment>
        <Adr36DataSection
          content={message}
          isShowRawMessage={messageIsShownAsJSON}
          isCollapsable={false}
          onToggle={setIsMessageExpanded}
        />
        <Gutter size="0.725rem" />
        <Adr36DataSection
          content={rawMessage}
          isShowRawMessage={true}
          isCollapsable={true}
          onToggle={setIsRawMessageExpanded}
        />
      </React.Fragment>
    );
  }

  if (message) {
    return (
      <Adr36DataSection
        content={message}
        isShowRawMessage={false}
        isCollapsable={false}
        onToggle={setIsMessageExpanded}
      />
    );
  }

  if (rawMessage) {
    return (
      <Adr36DataSection
        content={rawMessage}
        isShowRawMessage={true}
        isCollapsable={false}
        onToggle={setIsRawMessageExpanded}
      />
    );
  }
  return null;
};

interface Adr36DataSectionProps {
  content?: string;
  isShowRawMessage: boolean;
  isCollapsable: boolean;
  onToggle?: (expanded: boolean) => void;
}

const Adr36DataSection: FunctionComponent<Adr36DataSectionProps> = ({
  content,
  isShowRawMessage,
  isCollapsable,
  onToggle,
}) => {
  const theme: DefaultTheme = useTheme();

  const [expanded, setExpanded] = useState<boolean>(
    isShowRawMessage && isCollapsable ? false : true
  );
  const [needsEllipsis, setNeedsEllipsis] = useState<boolean>(false);
  const preRef = useRef<HTMLPreElement>(null);

  useLayoutEffect(() => {
    if (!isShowRawMessage && preRef.current) {
      const THRESHOLD: number = isRunningInSidePanel() ? 300 : 72;
      const contentHeight: number = preRef.current.scrollHeight;

      if (contentHeight > THRESHOLD) {
        setNeedsEllipsis(true);
        setExpanded(false);
      } else {
        setNeedsEllipsis(false);
        setExpanded(true);
      }
    }
  }, [content, isShowRawMessage]);

  const handleToggle = (e: MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setExpanded((prev: boolean) => {
      const newValue = !prev;
      onToggle?.(newValue);
      return newValue;
    });
  };

  const containerStyle: React.CSSProperties = {
    overflow: "auto",
    boxShadow:
      theme.mode === "light"
        ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
        : "none",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    overflowX: "auto",
    borderRadius: "0.375rem",
    backgroundColor:
      theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"],
    padding: "1rem",
    minHeight: "3rem",
  };

  const preStyle: React.CSSProperties = {
    margin: 0,
    fontWeight: 400,
    fontSize: isShowRawMessage ? "0.875rem" : "1rem",
    ...(isShowRawMessage
      ? {
          color: ColorPalette["gray-200"],
          wordBreak: "break-all",
          whiteSpace: "pre-wrap",
        }
      : {
          color:
            theme.mode === "light"
              ? ColorPalette["gray-500"]
              : ColorPalette["white"],
          whiteSpace: "normal",
          overflowWrap: "break-word",
        }),
  };

  const ellipsisStyle: React.CSSProperties =
    !isShowRawMessage && needsEllipsis && !expanded
      ? {
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          textOverflow: "ellipsis",
          overflow: "hidden",
          WebkitLineClamp: 3,
        }
      : {};

  const computedPreStyle = { ...preStyle, ...ellipsisStyle };

  return (
    <SimpleBar autoHide={false} style={containerStyle}>
      {isCollapsable ? (
        <AdvancedTitle onClick={handleToggle} />
      ) : (
        <MessageTitle />
      )}
      <Box>
        {isCollapsable ? (
          expanded && (
            <React.Fragment>
              <Gutter size={isShowRawMessage ? "1rem" : "0.5rem"} />
              <pre style={preStyle} ref={preRef}>
                {content}
              </pre>
            </React.Fragment>
          )
        ) : (
          <React.Fragment>
            <Gutter size={isShowRawMessage ? "1rem" : "0.5rem"} />
            <pre style={computedPreStyle} ref={preRef}>
              {content}
            </pre>
            {needsEllipsis && (
              <div
                onClick={handleToggle}
                style={{
                  cursor: "pointer",
                  marginTop: "0.75rem",
                }}
              >
                <Subtitle4 color={ColorPalette["gray-200"]}>
                  {expanded ? (
                    <FormattedMessage id="page.sign.adr36.show-less-detail" />
                  ) : (
                    <FormattedMessage id="page.sign.adr36.show-more-detail" />
                  )}
                </Subtitle4>
              </div>
            )}
          </React.Fragment>
        )}
      </Box>
    </SimpleBar>
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
        <Subtitle4>
          <FormattedMessage id="page.sign.adr36.message" />
        </Subtitle4>
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
          <FormattedMessage id="page.sign.adr36.raw-message" />
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
