import React, {
  FunctionComponent,
  PropsWithChildren,
  useMemo,
  useRef,
  useState,
} from "react";
import { ConfirmContext } from "./internal";
import { Modal } from "../../components/modal";
import { XAxis, YAxis } from "../../components/axis";
import { Box } from "../../components/box";
import { ColorPalette } from "../../styles";
import { Body2, Subtitle1 } from "../../components/typography";
import { Gutter } from "../../components/gutter";
import { Button } from "../../components/button";
import { FormattedMessage } from "react-intl";
import { useTheme } from "styled-components";
import { TextButton } from "../../components/button-text";

export const ConfirmProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const theme = useTheme();
  const [confirms, setConfirms] = useState<
    {
      id: string;
      detached: boolean;

      title: string;
      paragraph: string | React.ReactNode;
      options: {
        forceYes?: boolean;
        yesText?: string;
        cancelText?: string;
      };
      resolver: (value: boolean) => void;
    }[]
  >([]);

  const seqRef = useRef(0);
  const confirmFn: (
    title: string,
    paragraph: string | React.ReactNode,
    options?: {
      forceYes?: boolean;
      yesText?: string;
      cancelText?: string;
    }
  ) => Promise<boolean> = (title, paragraph, options = {}) => {
    return new Promise<boolean>((resolve) => {
      seqRef.current = seqRef.current + 1;

      setConfirms((prev) => [
        ...prev,
        {
          id: seqRef.current.toString(),
          detached: false,

          title,
          paragraph,
          options,
          resolver: resolve,
        },
      ]);
    });
  };
  const confirmFnRef = useRef(confirmFn);
  confirmFnRef.current = confirmFn;

  return (
    <ConfirmContext.Provider
      value={useMemo(() => {
        return {
          confirm: confirmFnRef.current,
        };
      }, [])}
    >
      {children}
      {confirms.map((confirm) => {
        const detach = () => {
          setConfirms((prev) => {
            return prev.map((c) => {
              if (c.id === confirm.id) {
                return {
                  ...c,
                  detached: true,
                };
              } else {
                return c;
              }
            });
          });
        };

        const yes = () => {
          if (confirm.detached) {
            return;
          }

          confirm.resolver(true);
          detach();
        };

        const no = () => {
          if (confirm.detached) {
            return;
          }

          confirm.resolver(false);
          detach();
        };

        return (
          <Modal
            key={confirm.id}
            isOpen={!confirm.detached}
            close={() => {
              if (confirm.options.forceYes) {
                return;
              }

              no();
            }}
            onCloseTransitionEnd={() => {
              setConfirms((prev) => {
                return prev.filter((c) => c.id !== confirm.id);
              });
            }}
            align="center"
          >
            <YAxis alignX="center">
              <Box
                width="85%"
                maxWidth="22.5rem"
                backgroundColor={
                  theme.mode === "light"
                    ? ColorPalette["white"]
                    : ColorPalette["gray-600"]
                }
                paddingX="1.25rem"
                paddingY="1.5rem"
                borderRadius="0.5rem"
              >
                <YAxis>
                  {confirm.title ? (
                    <React.Fragment>
                      <Subtitle1
                        style={{
                          color:
                            theme.mode === "light"
                              ? ColorPalette["gray-700"]
                              : ColorPalette["gray-10"],
                        }}
                      >
                        {confirm.title}
                      </Subtitle1>
                      <Gutter size="0.5rem" />
                    </React.Fragment>
                  ) : null}

                  <Body2
                    style={{
                      color:
                        theme.mode === "light"
                          ? ColorPalette["gray-300"]
                          : ColorPalette["gray-200"],
                    }}
                  >
                    {confirm.paragraph}
                  </Body2>
                  <Gutter size="1.125rem" />
                  <YAxis alignX="right">
                    <XAxis>
                      {!confirm.options.forceYes ? (
                        <React.Fragment>
                          <TextButton
                            size="small"
                            text={
                              confirm.options.cancelText || (
                                <FormattedMessage id="hooks.confirm.cancel-button" />
                              )
                            }
                            style={{
                              minWidth: "4.875rem",
                            }}
                            onClick={no}
                          />
                          <Gutter size="0.75rem" />
                        </React.Fragment>
                      ) : null}
                      <Button
                        size="small"
                        text={
                          confirm.options.yesText || (
                            <FormattedMessage id="hooks.confirm.yes-button" />
                          )
                        }
                        style={{
                          minWidth: "4.875rem",
                        }}
                        onClick={yes}
                      />
                    </XAxis>
                  </YAxis>
                </YAxis>
              </Box>
            </YAxis>
          </Modal>
        );
      })}
    </ConfirmContext.Provider>
  );
};
