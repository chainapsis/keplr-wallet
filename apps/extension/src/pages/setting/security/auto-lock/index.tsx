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
  GetLockOnSleepMsg,
  SetLockOnSleepMsg,
  UpdateAutoLockAccountDurationMsg,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { YAxis } from "../../../../components/axis";
import { FormattedMessage, useIntl } from "react-intl";
import { useEffectOnce } from "../../../../hooks/use-effect-once";
import { useTheme } from "styled-components";

export const SettingSecurityAutoLockPage: FunctionComponent = observer(() => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const intl = useIntl();
  const theme = useTheme();

  const minDuration = 0;
  const maxDuration = 4320;

  const { watch, setValue, register, handleSubmit, formState, setFocus } =
    useForm<{
      timer: string;
    }>({
      mode: "onChange",
      defaultValues: {
        timer: "0",
      },
    });

  const watchTimer = watch("timer");
  const watchTimerParsed = parseInt(watchTimer);

  const [lockOnSleep, setLockOnSleep] = useState(false);

  useEffect(() => {
    new InExtensionMessageRequester()
      .sendMessage(BACKGROUND_PORT, new GetAutoLockAccountDurationMsg())
      .then(function (duration) {
        setValue("timer", Math.floor(duration / 60000).toString());
      });

    new InExtensionMessageRequester()
      .sendMessage(BACKGROUND_PORT, new GetLockOnSleepMsg())
      .then((lockOnSleep) => {
        setLockOnSleep(lockOnSleep);
      });
  }, [setValue]);

  useEffectOnce(() => {
    setFocus("timer");
  });

  return (
    <HeaderLayout
      title={intl.formatMessage({
        id: "page.setting.security.auto-lock-title",
      })}
      left={<BackButton />}
      bottomButtons={[
        {
          text: intl.formatMessage({
            id: "button.confirm",
          }),
          color: "secondary",
          size: "large",
          type: "submit",
          isLoading,
        },
      ]}
      onSubmit={handleSubmit(async (data) => {
        setIsLoading(true);

        let duration = parseInt(data.timer);
        if (!Number.isNaN(duration) && duration >= 0) {
          duration = duration * 60000;
          const msg = new UpdateAutoLockAccountDurationMsg(duration);
          await new InExtensionMessageRequester().sendMessage(
            BACKGROUND_PORT,
            msg
          );

          if (duration === 0) {
            await new InExtensionMessageRequester().sendMessage(
              BACKGROUND_PORT,
              new UpdateAutoLockAccountDurationMsg(0)
            );
            await new InExtensionMessageRequester().sendMessage(
              BACKGROUND_PORT,
              new SetLockOnSleepMsg(lockOnSleep)
            );
          }
        } else {
          await new InExtensionMessageRequester().sendMessage(
            BACKGROUND_PORT,
            new UpdateAutoLockAccountDurationMsg(0)
          );
          await new InExtensionMessageRequester().sendMessage(
            BACKGROUND_PORT,
            new SetLockOnSleepMsg(lockOnSleep)
          );
        }

        setIsLoading(false);

        navigate(-1);
      })}
    >
      <Box paddingX="0.75rem" alignX="center">
        <Body2
          color={
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"]
          }
          style={{ textAlign: "center", padding: "2rem 1.25rem" }}
        >
          <FormattedMessage id="page.setting.security.auto-lock.paragraph" />
        </Body2>

        <YAxis alignX="center">
          <Gutter size="2.5rem" direction="vertical" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="66"
            height="66"
            fill="none"
            stroke="none"
            viewBox="0 0 66 66"
          >
            <path
              fill={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-300"]
              }
              d="M16.5 60.5q-2.268 0-3.883-1.614Q11.003 57.272 11 55V27.5q0-2.268 1.617-3.883Q14.234 22.003 16.5 22h2.75v-5.5q0-5.706 4.023-9.727Q27.296 2.753 33 2.75q5.703-.002 9.73 4.023 4.026 4.026 4.02 9.727V22h2.75q2.27 0 3.886 1.617T55 27.5V55q0 2.27-1.614 3.886T49.5 60.5zM33 46.75q2.27 0 3.886-1.614T38.5 41.25q-.003-2.271-1.614-3.883Q35.274 35.756 33 35.75t-3.883 1.617T27.5 41.25t1.617 3.886Q30.743 46.76 33 46.75M24.75 22h16.5v-5.5q0-3.438-2.406-5.844T33 8.25t-5.844 2.406T24.75 16.5z"
            />
          </svg>
          <Gutter size="2rem" direction="vertical" />
        </YAxis>

        <Gutter size="3.125rem" />

        <Box width="100%">
          <TextInput
            label={intl.formatMessage({
              id: "page.setting.security.auto-lock.timer-input-label",
            })}
            type="number"
            error={formState.errors.timer && formState.errors.timer.message}
            {...register("timer", {
              validate: (input: string): string | undefined => {
                if (input.trim().length === 0) {
                  return;
                }

                if (input.includes(".")) {
                  return intl.formatMessage({ id: "error.duration-type" });
                }

                const duration = parseInt(input);

                if (Number.isNaN(duration)) {
                  return "NaN";
                }

                if (duration < minDuration || duration > maxDuration) {
                  return intl.formatMessage(
                    { id: "error.duration-lange" },
                    {
                      minDuration,
                      maxDuration,
                    }
                  );
                }
              },
            })}
          />
        </Box>

        <Gutter size="1rem" />

        <Box
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette["gray-10"]
              : ColorPalette["gray-600"]
          }
          borderRadius="0.375rem"
          padding="1rem"
          width="100%"
        >
          <Columns sum={1} alignY="center">
            <Column weight={1}>
              <Stack gutter="0.375rem">
                <Subtitle2
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-700"]
                      : ColorPalette["gray-50"]
                  }
                >
                  <FormattedMessage id="page.setting.security.auto-lock.sleep-mode-title" />
                </Subtitle2>
                <Body3 color={ColorPalette["gray-200"]}>
                  <FormattedMessage
                    id="page.setting.security.auto-lock.sleep-mode-paragraph"
                    values={{ br: <br /> }}
                  />
                </Body3>
              </Stack>
            </Column>

            <Toggle
              isOpen={
                (!Number.isNaN(watchTimerParsed) && watchTimerParsed !== 0) ||
                lockOnSleep
              }
              setIsOpen={(value) => {
                if (Number.isNaN(watchTimerParsed) || watchTimerParsed === 0) {
                  setLockOnSleep(value);
                }
              }}
            />
          </Columns>
        </Box>
      </Box>
    </HeaderLayout>
  );
});
