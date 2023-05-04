import React, { FunctionComponent, useState } from "react";
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
import { TextButton } from "../../../components/button-text";

export const RegisterNamePasswordHardwareScene: FunctionComponent<{
  type: string;
}> = observer(({ type }) => {
  const sceneTransition = useSceneTransition();

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "step",
        title: "Set Up Your Wallet",
        stepCurrent: 3,
        stepTotal: 6,
      });
    },
  });

  const form = useFormNamePassword();

  const bip44PathState = useBIP44PathState();
  const [isBIP44CardOpen, setIsBIP44CardOpen] = useState(false);

  return (
    <RegisterSceneBox>
      <form
        onSubmit={form.handleSubmit((data) => {
          if (type === "ledger") {
            sceneTransition.push("connect-ledger", {
              name: data.name,
              password: data.password,
              app: "Cosmos",
              bip44Path: bip44PathState.getPath(),
            });
          } else {
            alert("TODO");
          }
        })}
      >
        <FormNamePassword
          {...form}
          appendButton={
            <TextButton
              text="Use Terra Ledger app"
              onClick={form.handleSubmit((data) => {
                sceneTransition.push("connect-ledger", {
                  name: data.name,
                  password: data.password,
                  app: "Terra",
                  bip44Path: bip44PathState.getPath(),
                });
              })}
            />
          }
        >
          <Gutter size="1.625rem" />
          <VerticalCollapseTransition width="100%" collapsed={isBIP44CardOpen}>
            <Box alignX="center">
              <Button
                size="small"
                color="secondary"
                text="Advanced"
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
        </FormNamePassword>
      </form>
    </RegisterSceneBox>
  );
});
