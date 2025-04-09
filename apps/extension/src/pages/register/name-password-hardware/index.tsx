import React, { FunctionComponent, useEffect, useState } from "react";
import { RegisterSceneBox } from "../components/register-scene-box";
import { Box } from "../../../components/box";
import { FormNamePassword, useFormNamePassword } from "../components/form";
import { useRegisterHeader } from "../components/header";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { SetBip44PathCard, useBIP44PathState } from "../components/bip-44-path";
import { VerticalCollapseTransition } from "../../../components/transition/vertical-collapse";
import { Button } from "../../../components/button";
import { Gutter } from "../../../components/gutter";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { Dropdown } from "../../../components/dropdown";
import { Label } from "../../../components/input";

export const RegisterNamePasswordHardwareScene: FunctionComponent<{
  type: string;
}> = observer(({ type }) => {
  const sceneTransition = useSceneTransition();
  const intl = useIntl();

  const [headerHasSet, setHeaderHasSet] = useState(false);
  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "step",
        title: intl.formatMessage({
          id: "pages.register.name-password-hardware.title",
        }),
        paragraphs: [
          intl.formatMessage({
            id: "pages.register.connect-ledger.paragraph",
          }),
        ],
        stepCurrent: 1,
        stepTotal: type === "keystone" ? 4 : 6,
      });
      setHeaderHasSet(true);
    },
  });

  const [keystoneWay, setKeystoneWay] = useState<string>("USB");
  const [isKeystoneUSB, setIsKeystoneUSB] = useState(true);
  useEffect(() => {
    if (headerHasSet && type === "keystone") {
      const prev = header.header;
      if ("stepTotal" in prev) {
        if (isKeystoneUSB) {
          // USB에서는 step 3개밖에 안 필요하더라...
          header.setHeader({ ...prev, stepTotal: 3 });
        } else {
          header.setHeader({ ...prev, stepTotal: 4 });
        }
      }
    }
  }, [header, headerHasSet, isKeystoneUSB, type]);

  const form = useFormNamePassword();

  const [connectTo, setConnectTo] = useState<string>("Cosmos");
  const bip44PathState = useBIP44PathState(true);
  const [isBIP44CardOpen, setIsBIP44CardOpen] = useState(false);

  return (
    <RegisterSceneBox>
      <form
        onSubmit={form.handleSubmit((data) => {
          if (type === "ledger") {
            sceneTransition.push("connect-ledger", {
              name: data.name,
              password: data.password,
              app: connectTo,
              bip44Path: bip44PathState.getPath(),
              stepPrevious: 1,
              stepTotal: 6,
            });
          } else if (type === "keystone") {
            if (isKeystoneUSB) {
              return sceneTransition.push("connect-keystone-usb", {
                name: data.name,
                password: data.password,
                bip44Path: isKeystoneUSB ? bip44PathState.getPath() : undefined,
                stepPrevious: 1,
                stepTotal: 3,
              });
            }
            return sceneTransition.push("connect-keystone-qr", {
              name: data.name,
              password: data.password,
              stepPrevious: 1,
              stepTotal: 4,
            });
          } else {
            throw new Error(`Invalid type: ${type}`);
          }
        })}
      >
        <FormNamePassword {...form} autoFocus={true}>
          {type === "ledger" ? (
            <React.Fragment>
              <Gutter size="1rem" />
              <Label
                content={intl.formatMessage({
                  id: "pages.register.name-password-hardware.connect-to",
                })}
              />
              <Dropdown
                color="text-input"
                size="large"
                selectedItemKey={connectTo}
                items={[
                  {
                    key: "Cosmos",
                    label: intl.formatMessage({
                      id: "pages.register.name-password-hardware.connect-to-cosmos",
                    }),
                  },
                  {
                    key: "Terra",
                    label: intl.formatMessage({
                      id: "pages.register.name-password-hardware.connect-to-terra",
                    }),
                  },
                  {
                    key: "Secret",
                    label: intl.formatMessage({
                      id: "pages.register.name-password-hardware.connect-to-secret",
                    }),
                  },
                ]}
                onSelect={(key) => {
                  setConnectTo(key);
                }}
              />
              <Gutter size="1.625rem" />
              <VerticalCollapseTransition
                width="100%"
                collapsed={isBIP44CardOpen}
              >
                <Box alignX="center">
                  <Button
                    size="small"
                    color="secondary"
                    text={intl.formatMessage({
                      id: "button.advanced",
                    })}
                    onClick={() => {
                      setIsBIP44CardOpen(true);
                    }}
                  />
                </Box>
              </VerticalCollapseTransition>
              <VerticalCollapseTransition collapsed={!isBIP44CardOpen}>
                <SetBip44PathCard
                  state={bip44PathState}
                  onClose={() => {
                    setIsBIP44CardOpen(false);
                  }}
                />
              </VerticalCollapseTransition>
              <Gutter size="1.25rem" />
            </React.Fragment>
          ) : undefined}
          {type === "keystone" ? (
            <React.Fragment>
              <Gutter size="1rem" />
              <Label
                content={intl.formatMessage({
                  id: "pages.register.name-password-hardware.connect-keystone-way",
                })}
              />
              <Dropdown
                color="text-input"
                size="large"
                selectedItemKey={keystoneWay}
                items={[
                  {
                    key: "USB",
                    label: intl.formatMessage({
                      id: "pages.register.name-password-hardware.connect-to-keystone-USB",
                    }),
                  },
                  {
                    key: "QR",
                    label: intl.formatMessage({
                      id: "pages.register.name-password-hardware.connect-to-keystone-QR",
                    }),
                  },
                ]}
                onSelect={(key) => {
                  setKeystoneWay(key);
                  setIsKeystoneUSB(key === "USB");
                }}
              />
              <Gutter size="1.625rem" />
              {isKeystoneUSB && (
                <React.Fragment>
                  <VerticalCollapseTransition
                    width="100%"
                    collapsed={isBIP44CardOpen}
                  >
                    <Box alignX="center">
                      <Button
                        size="small"
                        color="secondary"
                        text={intl.formatMessage({
                          id: "button.advanced",
                        })}
                        onClick={() => {
                          setIsBIP44CardOpen(true);
                        }}
                      />
                    </Box>
                  </VerticalCollapseTransition>
                  <VerticalCollapseTransition collapsed={!isBIP44CardOpen}>
                    <SetBip44PathCard
                      state={bip44PathState}
                      onClose={() => {
                        setIsBIP44CardOpen(false);
                      }}
                    />
                  </VerticalCollapseTransition>
                </React.Fragment>
              )}
              <Gutter size="1.25rem" />
            </React.Fragment>
          ) : undefined}
        </FormNamePassword>
      </form>
    </RegisterSceneBox>
  );
});
