import React, { FunctionComponent, useState } from "react";

import { Button, Form } from "reactstrap";

import {
  RegisterMode,
  RegisterStatus,
  useRegisterState
} from "../../../contexts/register";

import { FormattedMessage, useIntl } from "react-intl";
import style from "./style.module.scss";
import { BackButton } from "./index";
import { Input, TextArea } from "../../../components/form";
import useForm from "react-hook-form";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { AdvancedBIP44Option } from "./advanced-bip44";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

interface FormData {
  name: string;
  words: string;
  password: string;
  confirmPassword: string;
}

export const TypeRecoverMnemonic = "recover-mnemonic";

export const RecoverMnemonicPage: FunctionComponent = () => {
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
            registerState.setType(TypeRecoverMnemonic);
          }}
        >
          <FormattedMessage id="register.intro.button.import-account.title" />
        </Button>
      ) : null}
      {registerState.type === TypeRecoverMnemonic &&
      registerState.status === RegisterStatus.REGISTER ? (
        <NewMnemonicPageIn />
      ) : null}
    </React.Fragment>
  );
};

const NewMnemonicPageIn: FunctionComponent = observer(() => {
  const intl = useIntl();

  const { keyRingStore } = useStore();

  const registerState = useRegisterState();

  const { register, handleSubmit, getValues, errors } = useForm<FormData>({
    defaultValues: {
      name: "",
      words: "",
      password: "",
      confirmPassword: ""
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  return (
    <React.Fragment>
      {registerState.status === RegisterStatus.REGISTER ? (
        <div>
          <div className={style.title}>
            {intl.formatMessage({
              id: "register.recover.title"
            })}
          </div>
          <Form
            className={style.formContainer}
            onSubmit={handleSubmit(async (data: FormData) => {
              setIsLoading(true);

              try {
                if (registerState.mode === RegisterMode.ADD) {
                  await keyRingStore.addMnemonicKey(
                    data.words,
                    {
                      name: data.name
                    },
                    registerState.bip44HDPath
                  );
                } else {
                  await keyRingStore.createMnemonicKey(
                    data.words,
                    data.password,
                    { name: data.name },
                    registerState.bip44HDPath
                  );
                }
                await keyRingStore.save();
                registerState.setStatus(RegisterStatus.COMPLETE);
              } catch (e) {
                alert(e.message ? e.message : e.toString());
                registerState.clear();
              }
            })}
          >
            <TextArea
              className={style.mnemonic}
              placeholder={intl.formatMessage({
                id: "register.create.textarea.mnemonic.place-holder"
              })}
              name="words"
              rows={3}
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
            <Button
              color="primary"
              type="submit"
              block
              data-loading={isLoading}
            >
              <FormattedMessage id="register.create.button.next" />
            </Button>
          </Form>
          <BackButton onClick={registerState.clear} />
        </div>
      ) : null}
    </React.Fragment>
  );
});
