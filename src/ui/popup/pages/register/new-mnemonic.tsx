import React, { FunctionComponent, useEffect, useState } from "react";

import { Button, ButtonGroup, Form } from "reactstrap";

import {
  RegisterMode,
  RegisterStatus,
  useRegisterState
} from "../../../contexts/register";

import { FormattedMessage, useIntl } from "react-intl";
import style from "./style.module.scss";
import { BackButton, NunWords } from "./index";
import { Input, TextArea } from "../../../components/form";
import useForm from "react-hook-form";
import { KeyRingStore } from "../../stores/keyring";
import { AdvancedBIP44Option } from "./advanced-bip44";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

interface FormData {
  name: string;
  words: string;
  password: string;
  confirmPassword: string;
}

export const TypeNewMnemonic = "new-mnemonic";

export const NewMnemonicPage: FunctionComponent = () => {
  const registerState = useRegisterState();

  return (
    <React.Fragment>
      {registerState.status === RegisterStatus.INIT ? (
        <Button
          color="primary"
          outline
          block
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();

            registerState.setStatus(RegisterStatus.REGISTER);
            registerState.setType(TypeNewMnemonic);
          }}
        >
          <FormattedMessage id="register.intro.button.new-account.title" />
        </Button>
      ) : null}
      {registerState.status === RegisterStatus.REGISTER &&
      registerState.type === TypeNewMnemonic ? (
        <NewMnemonicPageIn />
      ) : null}
    </React.Fragment>
  );
};

const NewMnemonicPageIn: FunctionComponent = () => {
  const intl = useIntl();

  const registerState = useRegisterState();

  const [numWords, setNumWords] = useState<NunWords>(NunWords.WORDS12);

  const { register, handleSubmit, setValue, getValues, errors } = useForm<
    FormData
  >({
    defaultValues: {
      name: "",
      words: "",
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    if (!registerState.value) {
      if (numWords === NunWords.WORDS12) {
        setValue("words", KeyRingStore.GenereateMnemonic(128));
      } else if (numWords === NunWords.WORDS24) {
        setValue("words", KeyRingStore.GenereateMnemonic(256));
      } else {
        throw new Error("Unknown num words");
      }
    }

    // If page is returned from verifying page
    if (registerState.value) {
      setValue("words", registerState.value);

      const numWords = registerState.value.split(" ");
      if (numWords.length === 12) {
        setNumWords(NunWords.WORDS12);
      } else if (numWords.length === 24) {
        setNumWords(NunWords.WORDS24);
      } else {
        throw new Error("Unknown num words");
      }
    }

    if (registerState.name) {
      setValue("name", registerState.name);
    }
  }, [numWords, registerState.name, registerState.value, setValue]);

  return (
    <React.Fragment>
      {registerState.status === RegisterStatus.REGISTER ? (
        <div>
          <div className={style.title}>
            {intl.formatMessage({
              id: "register.create.title"
            })}
            <div style={{ float: "right" }}>
              <ButtonGroup size="sm" style={{ marginBottom: "4px" }}>
                <Button
                  type="button"
                  color="primary"
                  outline={numWords !== NunWords.WORDS12}
                  onClick={() => {
                    setNumWords(NunWords.WORDS12);
                  }}
                >
                  <FormattedMessage id="register.create.toggle.word12" />
                </Button>
                <Button
                  type="button"
                  color="primary"
                  outline={numWords !== NunWords.WORDS24}
                  onClick={() => {
                    setNumWords(NunWords.WORDS24);
                  }}
                >
                  <FormattedMessage id="register.create.toggle.word24" />
                </Button>
              </ButtonGroup>
            </div>
          </div>
          <Form
            className={style.formContainer}
            onSubmit={handleSubmit(async (data: FormData) => {
              registerState.setName(data.name);
              registerState.setValue(data.words);
              registerState.setPassword(data.password);

              registerState.setStatus(RegisterStatus.VERIFY);
            })}
          >
            <TextArea
              className={style.mnemonic}
              placeholder={intl.formatMessage({
                id: "register.create.textarea.mnemonic.place-holder"
              })}
              name="words"
              rows={numWords === NunWords.WORDS24 ? 5 : 3}
              readOnly={true}
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
              label={intl.formatMessage({
                id: "register.create.input.name"
              })}
              type="text"
              name="name"
              ref={register({
                required: intl.formatMessage({
                  id: "register.create.input.name.error.required"
                })
              })}
              error={errors.name && errors.name.message}
            />
            {registerState.mode === RegisterMode.CREATE ? (
              <React.Fragment>
                <Input
                  label={intl.formatMessage({
                    id: "register.create.input.password"
                  })}
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
                      id:
                        "register.create.input.confirm-password.error.required"
                    }),
                    validate: (confirmPassword: string): string | undefined => {
                      if (confirmPassword !== getValues()["password"]) {
                        return intl.formatMessage({
                          id:
                            "register.create.input.confirm-password.error.unmatched"
                        });
                      }
                    }
                  })}
                  error={
                    errors.confirmPassword && errors.confirmPassword.message
                  }
                />
              </React.Fragment>
            ) : null}
            <AdvancedBIP44Option />
            <Button color="primary" type="submit" block>
              <FormattedMessage id="register.create.button.next" />
            </Button>
          </Form>
          <BackButton onClick={registerState.clear} />
        </div>
      ) : null}
    </React.Fragment>
  );
};
