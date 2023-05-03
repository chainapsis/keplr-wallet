import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../../layouts/header";
import { BackButton } from "../../../../layouts/header/components";
import { Body2, Body3, Subtitle2 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { Box } from "../../../../components/box";
import { Gutter } from "../../../../components/gutter";
import { TextInput } from "../../../../components/input";
import { Column, Columns } from "../../../../components/column";
import { Stack } from "../../../../components/stack";
import { Toggle } from "../../../../components/toggle";
import {
  GetAutoLockAccountDurationMsg,
  UpdateAutoLockAccountDurationMsg,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

export const SettingSecurityAutoLockPage: FunctionComponent = observer(() => {
  const [isLoading, setIsLoading] = useState(false);
  const [initialDuration, setInitialDuration] = useState(0);
  const navigate = useNavigate();

  const minDuration = 0;
  const maxDuration = 4320;

  const { watch, setValue, register, handleSubmit, formState } = useForm<{
    timer: string;
  }>({
    defaultValues: {
      timer: "0",
    },
  });

  const watchTimer = watch("timer");

  useEffect(() => {
    const msg = new GetAutoLockAccountDurationMsg();
    new InExtensionMessageRequester()
      .sendMessage(BACKGROUND_PORT, msg)
      .then(function (duration) {
        setInitialDuration(duration / 60000);
        setValue("timer", (duration / 60000).toString());
      });
  }, [setValue]);

  return (
    <HeaderLayout
      title="Auto Lock"
      left={<BackButton />}
      bottomButton={{
        text: "Confirm",
        color: "secondary",
        size: "large",
        isLoading,
        disabled: initialDuration === parseInt(watchTimer),
      }}
      onSubmit={handleSubmit(async (data) => {
        setIsLoading(true);

        let duration = parseInt(data.timer);
        if (duration >= 0) {
          duration = duration * 60000;
          const msg = new UpdateAutoLockAccountDurationMsg(duration);
          await new InExtensionMessageRequester().sendMessage(
            BACKGROUND_PORT,
            msg
          );
        }

        setIsLoading(false);

        navigate(-1);
      })}
    >
      <Box paddingX="0.75rem" alignX="center">
        <Body2
          color={ColorPalette["gray-200"]}
          style={{ textAlign: "center", padding: "2rem 1.25rem" }}
        >
          You can set how long it takes Keplr to automatically lock.
        </Body2>

        <Box
          width="8.5rem"
          height="8.5rem"
          backgroundColor={ColorPalette["gray-200"]}
        >
          Image
        </Box>

        <Gutter size="3.125rem" />

        <Box width="100%">
          <TextInput
            label="Set Timer (unit: minutes)"
            type="number"
            error={formState.errors.timer && formState.errors.timer.message}
            {...register("timer", {
              required: true,
              validate: (input: string): string | undefined => {
                const duration = parseInt(input);

                if (Number.isNaN(duration)) {
                  return "NaN";
                }

                if (duration < minDuration || duration > maxDuration) {
                  return `The duration should be between ${minDuration} and ${maxDuration} minutes.`;
                }
              },
            })}
          />
        </Box>

        <Gutter size="1rem" />

        <Box
          backgroundColor={ColorPalette["gray-600"]}
          borderRadius="0.375rem"
          padding="1rem"
          width="100%"
        >
          <Columns sum={1} alignY="center">
            <Column weight={1}>
              <Stack gutter="0.375rem">
                <Subtitle2 color={ColorPalette["gray-50"]}>
                  Lock Keplr on Sleep Mode
                </Subtitle2>
                <Body3 color={ColorPalette["gray-200"]}>
                  Lock Keplr when the device is
                  <br /> in sleep mode
                </Body3>
              </Stack>
            </Column>

            <Toggle isOpen={watchTimer !== "0"} />
          </Columns>
        </Box>
      </Box>
    </HeaderLayout>
  );
});
