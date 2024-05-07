import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { NotificationContext } from "./context";
import ReactDOM from "react-dom";
import { VerticalCollapseTransition } from "../../../components/transition/vertical-collapse";
import { Box } from "../../../components/box";
import { ColorPalette } from "../../../styles";
import { Body3, Subtitle4 } from "../../../components/typography";
import { Gutter } from "../../../components/gutter";
import { useTheme } from "styled-components";

export const NotificationProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<
    {
      id: string;
      detached: boolean;

      mode: "success" | "failed" | "plain";
      title: string;
      paragraph: string;
    }[]
  >([]);

  const root = useMemo(() => {
    const root = document.createElement("div");
    root.setAttribute("id", "notification-root");
    document.body.appendChild(root);

    root.style.position = "fixed";
    root.style.top = "0";
    root.style.bottom = "0";
    root.style.left = "0";
    root.style.right = "0";
    root.style.zIndex = "99999999";
    root.style.pointerEvents = "none";

    return root;
  }, []);

  const clearDetached = (id: string) => {
    const find = notifications.find((notification) => notification.id === id);
    if (find && find.detached) {
      setNotifications((prev) => {
        return prev.filter((notification) => notification.id !== id);
      });
    }
  };

  const hideFn = (id: string) => {
    setNotifications((prev) => {
      const newNotifications = prev.slice();
      const find = newNotifications.find(
        (notification) => notification.id === id
      );
      if (find) {
        find.detached = true;
      }
      return newNotifications;
    });
  };
  const hideFnRef = useRef(hideFn);
  hideFnRef.current = hideFn;

  const seqRef = useRef(0);
  const showFn: (
    mode: "success" | "failed" | "plain",
    title: string,
    paragraph: string
  ) => string = (mode, title, paragraph) => {
    seqRef.current = seqRef.current + 1;
    const id = seqRef.current.toString();

    setNotifications((prev) => [
      ...prev,
      {
        id,
        detached: false,

        mode,
        title,
        paragraph,
      },
    ]);

    setTimeout(() => {
      hideFnRef.current(id);
    }, 2500);

    return id;
  };
  const showFnRef = useRef(showFn);
  showFnRef.current = showFn;

  return (
    <NotificationContext.Provider
      value={useMemo(() => {
        return {
          show: showFnRef.current,
          hide: hideFnRef.current,
        };
      }, [])}
    >
      {children}
      {ReactDOM.createPortal(
        <React.Fragment>
          {notifications
            .slice()
            .reverse()
            .map((notification) => {
              return (
                <NotificationView
                  key={notification.id}
                  mode={notification.mode}
                  title={notification.title}
                  paragraph={notification.paragraph}
                  detached={notification.detached}
                  onTransitionEnd={() => {
                    clearDetached(notification.id);
                  }}
                />
              );
            })}
        </React.Fragment>,
        root
      )}
    </NotificationContext.Provider>
  );
};

const NotificationView: FunctionComponent<{
  detached: boolean;

  mode: "success" | "failed" | "plain";
  title: string;
  paragraph: string;

  onTransitionEnd: () => void;
}> = ({ detached, mode, title, paragraph, onTransitionEnd }) => {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();

  // XXX: VerticalCollapseTransition의 고질적인 문제로 인해서
  //      처음에 false로 시작한 후 그 직후 렌더링에서 바로 true로 했을 경우
  //      제대로 된 애니메이션이 실행되지 않는다.
  //      이 문제를 해결하기 위해서 VerticalCollapseTransition의 resize 핸들러가 작동한 후에
  //      visible을 true로 변경하도록 한다.
  const [resizeInit, setResizeInit] = useState(false);
  const [visibleOnAfterInit, setVisibleOnAfterInit] = useState(false);

  useEffect(() => {
    if (detached) {
      setVisible(false);
    } else {
      setVisibleOnAfterInit(true);
    }
  }, [detached]);

  useEffect(() => {
    if (resizeInit && visibleOnAfterInit) {
      setVisibleOnAfterInit(false);
      setVisible(true);
    }
  }, [resizeInit, visibleOnAfterInit]);

  const backgroundColor = (() => {
    switch (mode) {
      case "success":
        return theme.mode === "light"
          ? ColorPalette["green-100"]
          : ColorPalette["green-700"];
      case "failed":
        return theme.mode === "light" ? ColorPalette["orange-100"] : "#705512";
      default:
        return ColorPalette["gray-500"];
    }
  })();
  const titleColor = (() => {
    switch (mode) {
      case "success":
        return theme.mode === "light" ? ColorPalette["green-500"] : "white";
      case "failed":
        return theme.mode === "light" ? ColorPalette["orange-400"] : "white";
      default:
        return "white";
    }
  })();
  const paragraphColor = (() => {
    switch (mode) {
      case "success":
        return "white";
      case "failed":
        return "white";
      default:
        return "white";
    }
  })();

  return (
    <VerticalCollapseTransition
      collapsed={!visible}
      onTransitionEnd={onTransitionEnd}
      onResize={() => {
        setResizeInit(true);
      }}
    >
      <Box padding="0.75rem" paddingBottom="0">
        <Box
          padding="1.125rem"
          backgroundColor={backgroundColor}
          borderRadius="0.5rem"
          style={{
            pointerEvents: "auto",
          }}
        >
          <Subtitle4 color={titleColor}>{title}</Subtitle4>
          {paragraph ? (
            <React.Fragment>
              <Gutter size="0.375rem" />
              <Body3 color={paragraphColor}>{paragraph}</Body3>
            </React.Fragment>
          ) : null}
        </Box>
      </Box>
    </VerticalCollapseTransition>
  );
};
