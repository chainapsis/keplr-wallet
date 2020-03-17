import React, { FunctionComponent, useEffect } from "react";

import { Button, ButtonGroup, Form } from "reactstrap";

import { Input, TextArea } from "../../../components/form";

import useForm from "react-hook-form";

import style from "./style.module.scss";

import { FormattedMessage, useIntl } from "react-intl";
import { NunWords } from "./index";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

interface FormData {
  words: string;
  password: string;
  confirmPassword: string;
}

export const RegisterInPage: FunctionComponent<{
  onRegister: (words: string, password: string, recovered: boolean) => void;
  requestChaneNumWords?: (numWords: NunWords) => void;
  numWords?: NunWords;
  isRecover: boolean;
  isLoading: boolean;
  words: string;
}> = props => {
  const intl = useIntl();

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
      setValue("words", props.words);
    } else {
      setValue("words", "");
    }
  }, [isRecover, props.words, setValue]);

  return (
    <div>
      <div className={style.title}>
        {isRecover
          ? intl.formatMessage({
              id: "register.recover.title"
            })
          : intl.formatMessage({
              id: "register.create.title"
            })}
        {!isRecover ? (
          <div style={{ float: "right" }}>
            <ButtonGroup size="sm" style={{ marginBottom: "4px" }}>
              <Button
                type="button"
                color={
                  props.numWords === NunWords.WORDS12 ? "primary" : "secondary"
                }
                onClick={() => {
                  if (
                    props.requestChaneNumWords &&
                    props.numWords !== NunWords.WORDS12
                  ) {
                    props.requestChaneNumWords(NunWords.WORDS12);
                  }
                }}
              >
                <FormattedMessage id="register.create.toggle.word12" />
              </Button>
              <Button
                type="button"
                color={
                  props.numWords === NunWords.WORDS24 ? "primary" : "secondary"
                }
                onClick={() => {
                  if (
                    props.requestChaneNumWords &&
                    props.numWords !== NunWords.WORDS24
                  ) {
                    props.requestChaneNumWords(NunWords.WORDS24);
                  }
                }}
              >
                <FormattedMessage id="register.create.toggle.word24" />
              </Button>
            </ButtonGroup>
          </div>
        ) : null}
      </div>
      <Form
        className={style.formContainer}
        onSubmit={handleSubmit((data: FormData) => {
          props.onRegister(data.words, data.password, isRecover);
        })}
      >
        <TextArea
          className={style.mnemonic}
          placeholder={intl.formatMessage({
            id: "register.create.textarea.mnemonic.place-holder"
          })}
          readOnly={!isRecover}
          name="words"
          rows={props.numWords === NunWords.WORDS24 ? 5 : 3}
          ref={register({
            required: "Mnemonic is required",
            validate: (value: string): string | undefined => {
              if (value.split(" ").length < 8) {
                return intl.formatMessage({
                  id: "register.create.textarea.mnemonic.error.too-short"
                });
              }

              if (!bip39.validateMnemonic(value)) {
                return intl.formatMessage({
                  id: "register.create.textarea.mnemonic.error.invalid"
                });
              }
            }
          })}
          error={errors.words && errors.words.message}
        />
        <Input
          label={intl.formatMessage({ id: "register.create.input.password" })}
          type="password"
          name="password"
          ref={register({
            required: intl.formatMessage({
              id: "register.create.input.password.error.required"
            }),
            validate: (password: string): string | undefined => {
              if (password.length < 8) {
                return intl.formatMessage({
                  id: "register.create.input.password.error.too-short"
                });
              }
            }
          })}
          error={errors.password && errors.password.message}
        />
        <Input
          label={intl.formatMessage({
            id: "register.create.input.confirm-password"
          })}
          type="password"
          name="confirmPassword"
          ref={register({
            required: intl.formatMessage({
              id: "register.create.input.confirm-password.error.required"
            }),
            validate: (confirmPassword: string): string | undefined => {
              if (confirmPassword !== getValues()["password"]) {
                return intl.formatMessage({
                  id: "register.create.input.confirm-password.error.unmatched"
                });
              }
            }
          })}
          error={errors.confirmPassword && errors.confirmPassword.message}
        />
        <Button
          color="primary"
          type="submit"
          data-loading={props.isLoading}
          block
        >
          <FormattedMessage id="register.create.button.next" />
        </Button>
      </Form>
    </div>
  );
};
