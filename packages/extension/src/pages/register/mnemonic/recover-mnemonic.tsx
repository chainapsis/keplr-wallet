import React, { FunctionComponent, useCallback, useState } from "react";

import { Button, Form } from "reactstrap";

import { FormattedMessage, useIntl } from "react-intl";
import style from "../style.module.scss";
import styleRecoverMnemonic from "./recover-mnemonic.module.scss";
import { BackButton } from "../index";
import { Input, PasswordInput, TextArea } from "../../../components/form";
import useForm from "react-hook-form";
import { observer } from "mobx-react-lite";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { AdvancedBIP44Option, useBIP44Option } from "../advanced-bip44";

import { Buffer } from "buffer/";
import { useStore } from "../../../stores";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

function isPrivateKey(str: string): boolean {
  if (str.startsWith("0x")) {
    return true;
  }

  if (str.length === 64) {
    try {
      return Buffer.from(str, "hex").length === 32;
    } catch {
      return false;
    }
  }
  return false;
}

function trimWordsStr(str: string): string {
  str = str.trim();
  // Split on the whitespace or new line.
  const splited = str.split(/\s+/);
  const words = splited
    .map((word) => word.trim())
    .filter((word) => word.trim().length > 0);
  return words.join(" ");
}

interface FormData {
  name: string;
  words: string;
  password: string;
  confirmPassword: string;
}

export const TypeRecoverMnemonic = "recover-mnemonic";

export const RecoverMnemonicIntro: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const { analyticsStore } = useStore();

  return (
    <Button
      color="primary"
      outline
      block
      size="lg"
      onClick={(e) => {
        e.preventDefault();

        registerConfig.setType(TypeRecoverMnemonic);
        analyticsStore.logEvent("Import account started", {
          registerType: "seed",
        });
      }}
    >
      <FormattedMessage id="register.intro.button.import-account.title" />
    </Button>
  );
});

export const RecoverMnemonicPage: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const intl = useIntl();

  const bip44Option = useBIP44Option();

  const { analyticsStore } = useStore();

  const { register, handleSubmit, getValues, errors } = useForm<FormData>({
    defaultValues: {
      name: "",
      words: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [shownMnemonicIndex, setShownMnemonicIndex] = useState(-1);

  return (
    <React.Fragment>
      <div>
        <div className={style.title}>
          {intl.formatMessage({
            id: "register.recover.title",
          })}
        </div>
        <Form
          className={style.formContainer}
          onSubmit={handleSubmit(async (data: FormData) => {
            try {
              if (!isPrivateKey(data.words)) {
                await registerConfig.createMnemonic(
                  data.name,
                  trimWordsStr(data.words),
                  data.password,
                  bip44Option.bip44HDPath
                );
                analyticsStore.setUserProperties({
                  registerType: "seed",
                  accountType: "mnemonic",
                });
              } else {
                const privateKey = Buffer.from(
                  data.words.trim().replace("0x", ""),
                  "hex"
                );
                await registerConfig.createPrivateKey(
                  data.name,
                  privateKey,
                  data.password
                );
                analyticsStore.setUserProperties({
                  registerType: "seed",
                  accountType: "privateKey",
                });
              }
            } catch (e) {
              alert(e.message ? e.message : e.toString());
              registerConfig.clear();
            }
          })}
        >
          <div className={styleRecoverMnemonic.mnemonicContainer}>
            {new Array(12).fill(0).map((_, index) => {
              return (
                <div
                  key={index}
                  className={styleRecoverMnemonic.mnemonicWordContainer}
                >
                  <div className={styleRecoverMnemonic.order}>{index + 1}.</div>
                  <Input
                    type={shownMnemonicIndex === index ? "text" : "password"}
                    formGroupClassName={
                      styleRecoverMnemonic.mnemonicWordFormGroup
                    }
                    className={styleRecoverMnemonic.mnemonicWord}
                    append={
                      <div
                        style={{
                          position: "absolute",
                          right: "8px",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          zIndex: 1000,
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          setShownMnemonicIndex((prev) => {
                            if (prev === index) {
                              return -1;
                            }
                            return index;
                          });
                        }}
                      >
                        {shownMnemonicIndex === index ? (
                          <IconOpenEye />
                        ) : (
                          <IconClosedEye />
                        )}
                      </div>
                    }
                  />
                </div>
              );
            })}
          </div>
          <div className={styleRecoverMnemonic.formInnerContainer}>
            <Input
              label={intl.formatMessage({
                id: "register.name",
              })}
              type="text"
              name="name"
              ref={register({
                required: intl.formatMessage({
                  id: "register.name.error.required",
                }),
              })}
              error={errors.name && errors.name.message}
            />
            {registerConfig.mode === "create" ? (
              <React.Fragment>
                <PasswordInput
                  label={intl.formatMessage({
                    id: "register.create.input.password",
                  })}
                  name="password"
                  ref={register({
                    required: intl.formatMessage({
                      id: "register.create.input.password.error.required",
                    }),
                    validate: (password: string): string | undefined => {
                      if (password.length < 8) {
                        return intl.formatMessage({
                          id: "register.create.input.password.error.too-short",
                        });
                      }
                    },
                  })}
                  error={errors.password && errors.password.message}
                />
                <PasswordInput
                  label={intl.formatMessage({
                    id: "register.create.input.confirm-password",
                  })}
                  name="confirmPassword"
                  ref={register({
                    required: intl.formatMessage({
                      id:
                        "register.create.input.confirm-password.error.required",
                    }),
                    validate: (confirmPassword: string): string | undefined => {
                      if (confirmPassword !== getValues()["password"]) {
                        return intl.formatMessage({
                          id:
                            "register.create.input.confirm-password.error.unmatched",
                        });
                      }
                    },
                  })}
                  error={
                    errors.confirmPassword && errors.confirmPassword.message
                  }
                />
              </React.Fragment>
            ) : null}
            <div
              style={{
                height: "20px",
              }}
            />
            <AdvancedBIP44Option bip44Option={bip44Option} />
            <Button
              color="primary"
              type="submit"
              size="lg"
              block
              style={{
                width: "50%",
              }}
              data-loading={registerConfig.isLoading}
            >
              <FormattedMessage id="register.create.button.next" />
            </Button>
          </div>
        </Form>
        <BackButton
          onClick={() => {
            registerConfig.clear();
          }}
        />
      </div>
    </React.Fragment>
  );
});

const IconClosedEye: FunctionComponent<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 28, height = 29, color = "#C6C6CD" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 28 29"
    >
      <path
        fill={color}
        d="M23.625 25.302a.868.868 0 01-.618-.256L3.757 5.796a.875.875 0 011.237-1.237l19.25 19.25a.876.876 0 01-.619 1.493zm-9.643-3.5c-2.27 0-4.457-.671-6.504-1.996-1.863-1.203-3.54-2.926-4.85-4.977v-.004c1.09-1.562 2.284-2.884 3.567-3.949a.11.11 0 00.008-.16l-1.09-1.088a.11.11 0 00-.148-.007c-1.362 1.148-2.627 2.557-3.777 4.207a1.746 1.746 0 00-.035 1.943c1.444 2.26 3.303 4.164 5.374 5.504 2.333 1.511 4.843 2.277 7.455 2.277 1.41-.004 2.81-.237 4.145-.688a.11.11 0 00.042-.181l-1.18-1.18a.218.218 0 00-.21-.055c-.913.236-1.853.354-2.797.354zm12.861-7.951c-1.447-2.238-3.324-4.14-5.429-5.498-2.328-1.505-4.898-2.301-7.432-2.301-1.395.003-2.78.24-4.096.702a.11.11 0 00-.04.18l1.178 1.18a.219.219 0 00.212.054 10.545 10.545 0 012.746-.366c2.225 0 4.407.68 6.483 2.023 1.898 1.226 3.595 2.947 4.909 4.977a.007.007 0 01.001.004l-.001.005a16.993 16.993 0 01-3.507 3.977.109.109 0 00-.033.124.109.109 0 00.025.038l1.088 1.087a.11.11 0 00.148.007 18.784 18.784 0 003.754-4.292 1.76 1.76 0 00-.006-1.902z"
      />
      <path
        fill={color}
        d="M14 9.552c-.393 0-.785.044-1.168.131a.11.11 0 00-.055.185l6.157 6.155a.11.11 0 00.185-.054A5.25 5.25 0 0014 9.552zM9.066 13.58a.11.11 0 00-.108-.028.109.109 0 00-.076.083 5.25 5.25 0 006.289 6.289.11.11 0 00.054-.185L9.066 13.58z"
      />
    </svg>
  );
};

const IconOpenEye: FunctionComponent<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 28, height = 29, color = "#C6C6CD" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 28 29"
    >
      <path fill={color} d="M14 18.302a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
      <path
        fill={color}
        d="M26.843 13.85c-1.447-2.238-3.325-4.139-5.429-5.498-2.328-1.505-4.898-2.3-7.433-2.3-2.325 0-4.611.664-6.796 1.975-2.227 1.336-4.245 3.287-5.998 5.8a1.746 1.746 0 00-.035 1.944c1.445 2.26 3.303 4.164 5.375 5.504 2.332 1.511 4.843 2.277 7.454 2.277 2.555 0 5.13-.79 7.449-2.282 2.103-1.354 3.977-3.262 5.418-5.519a1.76 1.76 0 00-.005-1.9zM14 20.052a5.25 5.25 0 110-10.5 5.25 5.25 0 010 10.5z"
      />
    </svg>
  );
};
