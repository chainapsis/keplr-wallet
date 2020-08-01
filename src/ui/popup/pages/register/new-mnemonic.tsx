import React, {
  FunctionComponent,
  MouseEvent,
  useCallback,
  useEffect,
  useState
} from "react";

import { Button, ButtonGroup, Form } from "reactstrap";

import { RegisterStatus, useRegisterState } from "../../../contexts/register";

import { FormattedMessage, useIntl } from "react-intl";
import style from "./style.module.scss";
import { BackButton, NunWords } from "./index";
import { Input, TextArea } from "../../../components/form";
import useForm from "react-hook-form";
import { KeyRingStore } from "../../stores/keyring";
import { observer } from "mobx-react";
import { useStore } from "../../stores";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

interface FormData {
  words: string;
  password: string;
  confirmPassword: string;
}

export const TypeNewMnemonic = "new-mnemonic";
export const TypeRecoverMnemonic = "recover-mnemonic";

export const NewMnemonicPage: FunctionComponent<{
  recover: boolean;
}> = ({ recover }) => {
  const registerState = useRegisterState();

  const isVisible =
    registerState.status === RegisterStatus.REGISTER &&
    ((registerState.type === TypeNewMnemonic && !recover) ||
      (registerState.type === TypeRecoverMnemonic && recover));

  const onNewButtonClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();

      registerState.setStatus(RegisterStatus.REGISTER);
      if (recover) {
        registerState.setType(TypeRecoverMnemonic);
      } else {
        registerState.setType(TypeNewMnemonic);
      }
    },
    [recover, registerState]
  );

  return (
    <React.Fragment>
      {registerState.status === RegisterStatus.INIT ? (
        <Button color="primary" outline block onClick={onNewButtonClick}>
          <FormattedMessage
            id={
              recover
                ? "register.intro.button.import-account.title"
                : "register.intro.button.new-account.title"
            }
          />
        </Button>
      ) : null}
      {isVisible ? <NewMnemonicPageIn recover={recover} /> : null}
    </React.Fragment>
  );
};

const NewMnemonicPageIn: FunctionComponent<{
  recover: boolean;
}> = observer(({ recover }) => {
  const intl = useIntl();

  const { keyRingStore } = useStore();

  const registerState = useRegisterState();

  const [numWords, setNumWords] = useState<NunWords>(NunWords.WORDS12);

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
    if (
      registerState.status === RegisterStatus.REGISTER &&
      !registerState.value
    ) {
      if (!recover) {
        if (numWords === NunWords.WORDS12) {
          setValue("words", KeyRingStore.GenereateMnemonic(128));
        } else if (numWords === NunWords.WORDS24) {
          setValue("words", KeyRingStore.GenereateMnemonic(256));
        } else {
          throw new Error("Unknown num words");
        }
      }
    }

    // If page is returned from verifying page
    if (
      registerState.status === RegisterStatus.REGISTER &&
      registerState.value
    ) {
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
  }, [numWords, recover, registerState, setValue]);

  const [isLoading, setIsLoading] = useState(false);

  return (
    <React.Fragment>
      {registerState.status === RegisterStatus.REGISTER ? (
        <div>
          <div className={style.title}>
            {intl.formatMessage({
              id: recover ? "register.recover.title" : "register.create.title"
            })}
            {!recover ? (
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
            ) : null}
          </div>
          <Form
            className={style.formContainer}
            onSubmit={handleSubmit(async (data: FormData) => {
              if (!recover && registerState.type !== TypeNewMnemonic) {
                throw new Error("Unmatched register type");
              }
              if (recover && registerState.type !== TypeRecoverMnemonic) {
                throw new Error("Unmatched register type");
              }

              registerState.setValue(data.words);
              registerState.setPassword(data.password);

              if (!recover) {
                registerState.setStatus(RegisterStatus.VERIFY);
              } else {
                setIsLoading(true);

                try {
                  await keyRingStore.createMnemonicKey(
                    data.words,
                    data.password
                  );
                  await keyRingStore.save();
                  registerState.setStatus(RegisterStatus.COMPLETE);
                } catch (e) {
                  alert(e.message ? e.message : e.toString());
                  registerState.clear();
                }
              }
            })}
          >
            <TextArea
              className={style.mnemonic}
              placeholder={intl.formatMessage({
                id: "register.create.textarea.mnemonic.place-holder"
              })}
              name="words"
              rows={numWords === NunWords.WORDS24 ? 5 : 3}
              readOnly={!recover}
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
                  id: "register.create.input.confirm-password.error.required"
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
              error={errors.confirmPassword && errors.confirmPassword.message}
            />
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
