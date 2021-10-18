import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { FormattedMessage, useIntl } from "react-intl";
import useForm from "react-hook-form";
import {
  AdvancedBIP44Option,
  BIP44Option,
  useBIP44Option,
} from "../advanced-bip44";
import style from "../style.module.scss";
import { Alert, Button, ButtonGroup, Form } from "reactstrap";
import { Input, TextArea } from "../../../components/form";
import { BackButton } from "../index";
import { NewMnemonicConfig, useNewMnemonicConfig, NumWords } from "./hook";
import { useStore } from "../../../stores";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

export const TypeNewMnemonic = "new-mnemonic";

interface FormData {
  name: string;
  words: string;
  password: string;
  confirmPassword: string;
}

export const NewMnemonicIntro: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const { analyticsStore } = useStore();

  return (
    <Button
      color="primary"
      outline
      block
      onClick={(e) => {
        e.preventDefault();

        registerConfig.setType(TypeNewMnemonic);
        console.log("here");
        analyticsStore.logEvent("Create account started", {
          registerType: "seed",
        });
      }}
    >
      <FormattedMessage id="register.intro.button.new-account.title" />
    </Button>
  );
});

export const NewMnemonicPage: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const newMnemonicConfig = useNewMnemonicConfig(registerConfig);
  const bip44Option = useBIP44Option();

  return (
    <React.Fragment>
      {newMnemonicConfig.mode === "generate" ? (
        <GenerateMnemonicModePage
          registerConfig={registerConfig}
          newMnemonicConfig={newMnemonicConfig}
          bip44Option={bip44Option}
        />
      ) : null}
      {newMnemonicConfig.mode === "verify" ? (
        <VerifyMnemonicModePage
          registerConfig={registerConfig}
          newMnemonicConfig={newMnemonicConfig}
          bip44Option={bip44Option}
        />
      ) : null}
    </React.Fragment>
  );
});

export const GenerateMnemonicModePage: FunctionComponent<{
  registerConfig: RegisterConfig;
  newMnemonicConfig: NewMnemonicConfig;
  bip44Option: BIP44Option;
}> = observer(({ registerConfig, newMnemonicConfig, bip44Option }) => {
  const intl = useIntl();

  const { register, handleSubmit, getValues, errors } = useForm<FormData>({
    defaultValues: {
      name: newMnemonicConfig.name,
      words: newMnemonicConfig.mnemonic,
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <div>
      <Alert color="warning">
        <h3 style={{ color: "white" }}>
          <FormattedMessage id="register.create.warning.keep-your-mnemonic.header" />
        </h3>
        <ul>
          <li>
            <FormattedMessage id="register.create.warning.keep-your-mnemonic.paragraph1" />
          </li>
          <li>
            <FormattedMessage id="register.create.warning.keep-your-mnemonic.paragraph2" />
          </li>
        </ul>
      </Alert>
      <div className={style.title}>
        {intl.formatMessage({
          id: "register.create.title",
        })}
        <div style={{ float: "right" }}>
          <ButtonGroup size="sm" style={{ marginBottom: "4px" }}>
            <Button
              type="button"
              color="primary"
              outline={newMnemonicConfig.numWords !== NumWords.WORDS12}
              onClick={() => {
                newMnemonicConfig.setNumWords(NumWords.WORDS12);
              }}
            >
              <FormattedMessage id="register.create.toggle.word12" />
            </Button>
            <Button
              type="button"
              color="primary"
              outline={newMnemonicConfig.numWords !== NumWords.WORDS24}
              onClick={() => {
                newMnemonicConfig.setNumWords(NumWords.WORDS24);
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
          newMnemonicConfig.setName(data.name);
          newMnemonicConfig.setPassword(data.password);

          newMnemonicConfig.setMode("verify");
        })}
      >
        <TextArea
          className={style.mnemonic}
          placeholder={intl.formatMessage({
            id: "register.create.textarea.mnemonic.place-holder",
          })}
          name="words"
          rows={newMnemonicConfig.numWords === NumWords.WORDS24 ? 5 : 3}
          readOnly={true}
          value={newMnemonicConfig.mnemonic}
          ref={register({
            required: "Mnemonic is required",
            validate: (value: string): string | undefined => {
              if (value.split(" ").length < 8) {
                return intl.formatMessage({
                  id: "register.create.textarea.mnemonic.error.too-short",
                });
              }

              if (!bip39.validateMnemonic(value)) {
                return intl.formatMessage({
                  id: "register.create.textarea.mnemonic.error.invalid",
                });
              }
            },
          })}
          error={errors.words && errors.words.message}
        />
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
            <Input
              label={intl.formatMessage({
                id: "register.create.input.password",
              })}
              type="password"
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
            <Input
              label={intl.formatMessage({
                id: "register.create.input.confirm-password",
              })}
              type="password"
              name="confirmPassword"
              ref={register({
                required: intl.formatMessage({
                  id: "register.create.input.confirm-password.error.required",
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
              error={errors.confirmPassword && errors.confirmPassword.message}
            />
          </React.Fragment>
        ) : null}
        <AdvancedBIP44Option bip44Option={bip44Option} />
        <Button color="primary" type="submit" block>
          <FormattedMessage id="register.create.button.next" />
        </Button>
      </Form>
      <BackButton
        onClick={() => {
          registerConfig.clear();
        }}
      />
    </div>
  );
});

export const VerifyMnemonicModePage: FunctionComponent<{
  registerConfig: RegisterConfig;
  newMnemonicConfig: NewMnemonicConfig;
  bip44Option: BIP44Option;
}> = observer(({ registerConfig, newMnemonicConfig, bip44Option }) => {
  const wordsSlice = useMemo(() => {
    const words = newMnemonicConfig.mnemonic.split(" ");
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].trim();
    }
    return words;
  }, [newMnemonicConfig.mnemonic]);

  const [randomizedWords, setRandomizedWords] = useState<string[]>([]);
  const [suggestedWords, setSuggestedWords] = useState<string[]>([]);

  useEffect(() => {
    // Set randomized words.
    const words = newMnemonicConfig.mnemonic.split(" ");
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].trim();
    }
    words.sort((word1, word2) => {
      // Sort alpahbetically.
      return word1 > word2 ? 1 : -1;
    });
    setRandomizedWords(words);
    // Clear suggested words.
    setSuggestedWords([]);
  }, [newMnemonicConfig.mnemonic]);

  const { analyticsStore, accountStore } = useStore();

  return (
    <div>
      <div style={{ minHeight: "153px" }}>
        <div className={style.buttons}>
          {suggestedWords.map((word, i) => {
            return (
              <Button
                key={word + i.toString()}
                onClick={() => {
                  const word = suggestedWords[i];
                  setSuggestedWords(
                    suggestedWords
                      .slice(0, i)
                      .concat(suggestedWords.slice(i + 1))
                  );
                  randomizedWords.push(word);
                  setRandomizedWords(randomizedWords.slice());
                }}
              >
                {word}
              </Button>
            );
          })}
        </div>
      </div>
      <hr />
      <div style={{ minHeight: "153px" }}>
        <div className={style.buttons}>
          {randomizedWords.map((word, i) => {
            return (
              <Button
                key={word + i.toString()}
                onClick={() => {
                  const word = randomizedWords[i];
                  setRandomizedWords(
                    randomizedWords
                      .slice(0, i)
                      .concat(randomizedWords.slice(i + 1))
                  );
                  suggestedWords.push(word);
                  setSuggestedWords(suggestedWords.slice());
                }}
              >
                {word}
              </Button>
            );
          })}
        </div>
      </div>
      <Button
        color="primary"
        type="submit"
        disabled={suggestedWords.join(" ") !== wordsSlice.join(" ")}
        block
        style={{
          marginTop: "30px",
        }}
        onClick={async (e) => {
          e.preventDefault();

          try {
            await registerConfig.createMnemonic(
              newMnemonicConfig.name,
              newMnemonicConfig.mnemonic,
              newMnemonicConfig.password,
              bip44Option.bip44HDPath
            );
            const accountInfo = accountStore.getAccount(
              analyticsStore.mainChainId
            );
            analyticsStore.setUserId(accountInfo.bech32Address);
            analyticsStore.setUserProperties({
              registerType: "seed",
              accountType: "mnemonic",
            });
            analyticsStore.logEvent("Create account finished", {
              accountType: "mnemonic",
            });
          } catch (e) {
            alert(e.message ? e.message : e.toString());
            registerConfig.clear();
          }
        }}
        data-loading={registerConfig.isLoading}
      >
        <FormattedMessage id="register.verify.button.register" />
      </Button>
      <BackButton
        onClick={() => {
          newMnemonicConfig.setMode("generate");
        }}
      />
    </div>
  );
});
