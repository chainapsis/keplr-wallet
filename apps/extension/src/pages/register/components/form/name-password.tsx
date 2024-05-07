import React, { FunctionComponent, PropsWithChildren, useRef } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { TextInput } from "../../../../components/input";
import { Gutter } from "../../../../components/gutter";
import { Button } from "../../../../components/button";
import { Stack } from "../../../../components/stack";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { YAxis } from "../../../../components/axis";
import { Box } from "../../../../components/box";
import { useSceneEvents } from "../../../../components/transition";
import { useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";

export interface FormDataNamePassword {
  name: string;
  password: string;
  confirmPassword: string;
}

export const useFormNamePassword = () => {
  return useForm<FormDataNamePassword>({
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
    },
  });
};

export const FormNamePassword: FunctionComponent<
  PropsWithChildren<
    UseFormReturn<FormDataNamePassword> & {
      appendButton?: React.ReactNode;
      autoFocus?: boolean;
    }
  >
> = observer(
  ({ children, register, formState, getValues, appendButton, autoFocus }) => {
    const { keyRingStore } = useStore();
    const intl = useIntl();
    const theme = useTheme();

    const needPassword = keyRingStore.keyInfos.length === 0;

    const { ref: nameRegisterRef, ...nameRegisterProps } = register("name", {
      required: true,
    });

    const nameTextInputRef = useRef<HTMLInputElement | null>(null);

    useSceneEvents({
      onDidVisible: () => {
        if (autoFocus && nameTextInputRef.current) {
          nameTextInputRef.current.focus();
        }
      },
    });

    return (
      <Stack gutter="1rem">
        {!needPassword ? (
          <YAxis alignX="center">
            <Gutter size="1rem" />
            <AddWalletImg
              color={
                theme.mode === "light"
                  ? ColorPalette["blue-100"]
                  : ColorPalette["gray-10"]
              }
            />
            <Gutter size="1rem" />
          </YAxis>
        ) : null}
        <TextInput
          label={intl.formatMessage({
            id: "pages.register.components.form.name-password.wallet-name-label",
          })}
          ref={(ref) => {
            nameRegisterRef(ref);
            nameTextInputRef.current = ref;
          }}
          {...nameRegisterProps}
          placeholder={intl.formatMessage({
            id: "pages.register.components.form.name-password.wallet-name-placeholder",
          })}
          error={formState.errors.name?.message}
        />
        {needPassword ? (
          <React.Fragment>
            <TextInput
              label={intl.formatMessage({
                id: "pages.register.components.form.name-password.password-label",
              })}
              type="password"
              placeholder={intl.formatMessage({
                id: "pages.register.components.form.name-password.password-placeholder",
              })}
              {...register("password", {
                required: true,
                validate: (password: string): string | undefined => {
                  if (password.length < 8) {
                    return intl.formatMessage({
                      id: "pages.register.components.form.name-password.short-password-error",
                    });
                  }
                },
              })}
              error={formState.errors.password?.message}
            />
            <TextInput
              label={intl.formatMessage({
                id: "pages.register.components.form.name-password.confirm-password-label",
              })}
              type="password"
              placeholder={intl.formatMessage({
                id: "pages.register.components.form.name-password.confirm-password-placeholder",
              })}
              {...register("confirmPassword", {
                required: true,
                validate: (confirmPassword: string): string | undefined => {
                  if (confirmPassword !== getValues("password")) {
                    return intl.formatMessage({
                      id: "pages.register.components.form.name-password.password-not-match-error",
                    });
                  }
                },
              })}
              error={formState.errors.confirmPassword?.message}
            />
          </React.Fragment>
        ) : null}
        {children ? (
          <React.Fragment>
            <Gutter size="0" />
            <Box>{children}</Box>
            <Gutter size="0" />
          </React.Fragment>
        ) : (
          <Gutter size="2.5rem" />
        )}
        <Button
          size="large"
          text={intl.formatMessage({
            id: "button.next",
          })}
          type="submit"
        />
        {appendButton}
      </Stack>
    );
  }
);

const AddWalletImg: FunctionComponent<{ color: string }> = ({ color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="93"
      height="86"
      fill="none"
      viewBox="0 0 93 86"
    >
      <path
        fill={color}
        fillRule="evenodd"
        d="M.118 11.704A19.986 19.986 0 0113.39 6.687h60.188c5.088 0 9.734 1.895 13.271 5.017C86.027 5.106 80.4 0 73.578 0H13.39C6.57 0 .94 5.106.118 11.704zm0 13.375a19.986 19.986 0 0113.272-5.017h60.188c5.088 0 9.734 1.895 13.271 5.017-.822-6.598-6.45-11.704-13.271-11.704H13.39C6.57 13.375.94 18.481.118 25.079zM.016 40.125c0-7.387 5.988-13.375 13.375-13.375h16.718a3.344 3.344 0 013.344 3.344c0 5.54 4.491 10.031 10.031 10.031 5.54 0 10.032-4.491 10.032-10.031a3.344 3.344 0 013.343-3.344h16.72c7.386 0 13.374 5.988 13.374 13.375v16.48a16.926 16.926 0 00-7.969-1.98c-9.388 0-17 7.611-17 17 0 3.148.856 6.097 2.348 8.625H13.39C6.004 80.25.016 74.262.016 66.875v-26.75z"
        clipRule="evenodd"
      />
      <circle cx="78.984" cy="71.625" r="14" fill="#2C4BE2" />
      <path
        fill="#fff"
        d="M77.986 76.625v-10h1.99v10h-1.99zm-4.002-4.009v-1.99h10v1.99h-10z"
      />
    </svg>
  );
};
