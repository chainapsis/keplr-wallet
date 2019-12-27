import React, { FunctionComponent, useEffect } from "react";

import { Input } from "../../../components/form";
import { Button } from "../../../components/button";

import useForm from "react-hook-form";
import { KeyRingStore } from "../../stores/keyring";

import style from "./style.module.scss";
import classnames from "classnames";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

interface FormData {
  words: string;
  password: string;
  confirmPassword: string;
}

export const RegisterInPage: FunctionComponent<{
  onRegister: (words: string, password: string, recovered: boolean) => void;
  isRecover: boolean;
  isLoading: boolean;
}> = props => {
  const { isRecover } = props;
  const { register, handleSubmit, setValue, getValues, errors } = useForm<
    FormData
  >({
    defaultValues: {
      words: "",
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    if (!isRecover) {
      setValue("words", KeyRingStore.GenereateMnemonic(160));
    } else {
      setValue("words", "");
    }
  }, [isRecover, setValue]);

  return (
    <div className={style.container}>
      <div className={style.intro}>
        Create Account
        <div className={style.subIntro}>Please safely store your mnemonic.</div>
      </div>
      <form
        className={style.formContainer}
        onSubmit={handleSubmit((data: FormData) => {
          props.onRegister(data.words, data.password, isRecover);
        })}
      >
        <div className="field">
          <div className="control">
            <textarea
              className={classnames(
                "textarea",
                "has-fixed-size is-medium",
                style.mnemonic
              )}
              placeholder="Type your mnemonic"
              disabled={!isRecover}
              name="words"
              rows={4}
              ref={register({
                required: "Mnemonic is required",
                validate: (value: string): string | undefined => {
                  if (value.split(" ").length < 8) {
                    return "Too short mnemonic";
                  }

                  if (!bip39.validateMnemonic(value)) {
                    return "Invalid mnemonic";
                  }
                }
              })}
            />
          </div>
          {errors.words && errors.words.message ? (
            <p className="help is-danger">{errors.words.message}</p>
          ) : null}
        </div>
        <Input
          label="Password"
          type="password"
          name="password"
          ref={register({
            required: "Password is required",
            validate: (password: string): string | undefined => {
              if (password.length < 8) {
                return "Too short password";
              }
            }
          })}
          error={errors.password && errors.password.message}
        />
        <Input
          label="Confirm password"
          type="password"
          name="confirmPassword"
          ref={register({
            required: "Confirm password is required",
            validate: (confirmPassword: string): string | undefined => {
              if (confirmPassword !== getValues()["password"]) {
                return "Password should match";
              }
            }
          })}
          error={errors.confirmPassword && errors.confirmPassword.message}
        />
        <div style={{ flex: 1 }} />
        <Button
          className={style.button}
          color="primary"
          type="submit"
          size="medium"
          loading={props.isLoading}
        >
          Next
        </Button>
      </form>
    </div>
  );
};
