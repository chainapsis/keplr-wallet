import React, { FunctionComponent, useMemo, useRef, useState } from "react";
import { ConfirmContext } from "./internal";
import { Modal } from "../../components/modal/v2";
import { XAxis, YAxis } from "../../components/axis";
import { Box } from "../../components/box";
import { ColorPalette } from "../../styles";
import { Body2, Subtitle1 } from "../../components/typography";
import { Gutter } from "../../components/gutter";
import { Button } from "../../components/button";

export const ConfirmProvider: FunctionComponent = ({ children }) => {
  const [confirms, setConfirms] = useState<
    {
      id: string;
      detached: boolean;

      title: string;
      paragraph: string;
      resolver: (value: boolean) => void;
    }[]
  >([]);

  const seqRef = useRef(0);
  const confirmFn: (title: string, paragraph: string) => Promise<boolean> = (
    title,
    paragraph
  ) => {
    return new Promise<boolean>((resolve) => {
      seqRef.current = seqRef.current + 1;

      setConfirms((prev) => [
        ...prev,
        {
          id: seqRef.current.toString(),
          detached: false,

          title,
          paragraph,
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
            close={no}
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
                backgroundColor={ColorPalette["gray-600"]}
                paddingX="1.25rem"
                paddingY="1.5rem"
                borderRadius="0.5rem"
              >
                <YAxis>
                  <Subtitle1
                    style={{
                      color: ColorPalette["gray-10"],
                    }}
                  >
                    {confirm.title}
                  </Subtitle1>
                  <Gutter size="0.5rem" />
                  <Body2
                    style={{
                      color: ColorPalette["gray-200"],
                    }}
                  >
                    {confirm.paragraph}
                  </Body2>
                  <Gutter size="1.125rem" />
                  <YAxis alignX="right">
                    <XAxis>
                      <Button
                        size="small"
                        color="secondary"
                        text="Cancel"
                        style={{
                          minWidth: "4.875rem",
                        }}
                        onClick={no}
                      />
                      <Gutter size="0.75rem" />
                      <Button
                        size="small"
                        text="Yes"
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
