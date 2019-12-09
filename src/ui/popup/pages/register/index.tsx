import React, { FunctionComponent, useState } from "react";

import { Button } from "../../../components/button";
import { Input } from "../../../components/form";

import { KeyRingStore } from "../../stores/keyring";

import { observer } from "mobx-react";
import { useStore } from "../../stores";

import useForm from "react-hook-form";

import { EmptyLayout } from "../../layouts/empty-layout";

import classnames from "classnames";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

import style from "./style.module.scss";

interface FormData {
  words: string;
  password: string;
  confirmPassword: string;
}

export const RegisterPage: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const { register, handleSubmit, getValues, errors } = useForm<FormData>({
    defaultValues: {
      words: KeyRingStore.GenereateMnemonic(),
      password: "",
      confirmPassword: ""
    }
  });

  const [isRecover, setIsRecover] = useState(false);

  const onSubmitMnemonic = async (words: string, password: string) => {
    await keyRingStore.createKey(words, password);
    await keyRingStore.save();
  };

  return (
    <EmptyLayout style={{ height: "100%", backgroundColor: "white" }}>
      <div className={style.container}>
        <div className={style.intro}>Write down your mnemonic</div>
        <form
          className={style.formContainer}
          onSubmit={handleSubmit(async (data: FormData) => {
            await onSubmitMnemonic(data.words, data.password);
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
                disabled={!isRecover}
                name="words"
                ref={register({
                  required: "Mnemonic is required",
                  validate: (value: string): string | undefined => {
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
            onClick={() => {
              setIsRecover(!isRecover);
            }}
            size="medium"
            type="button"
          >
            Recover
          </Button>
          <Button
            className={style.button}
            color="primary"
            type="submit"
            size="medium"
          >
            Next
          </Button>
        </form>
      </div>
    </EmptyLayout>
  );
});
