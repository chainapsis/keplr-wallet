import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import useForm from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Alert,
  Button,
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
} from "reactstrap";
import { Input, PasswordInput } from "../../../components/form";
import { useStore } from "../../../stores";
import {
  AdvancedBIP44Option,
  BIP44Option,
  useBIP44Option,
} from "../advanced-bip44";
import { BackButton } from "../index";
import style from "../style.module.scss";
import { NewMnemonicConfig, NumWords, useNewMnemonicConfig } from "./hook";

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
      block
      onClick={(e) => {
        e.preventDefault();

        registerConfig.setType(TypeNewMnemonic);
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

  const [isOpenWordsDropdown, setIsOpenWordsDropdown] = useState(false);

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
      <Alert color="danger-outline">
        <div className={style.alertTitle}>
          <FormattedMessage id="register.create.warning.keep-your-mnemonic.header" />
        </div>
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
        <div>
          <ButtonDropdown
            isOpen={isOpenWordsDropdown}
            toggle={() => setIsOpenWordsDropdown(!isOpenWordsDropdown)}
          >
            <DropdownToggle className={style.dropdownToggle}>
              {newMnemonicConfig.numWords === NumWords.WORDS12 ? (
                <FormattedMessage id="register.create.toggle.word12" />
              ) : (
                <FormattedMessage id="register.create.toggle.word24" />
              )}
              <img
                src={require("../../../public/assets/img/chevron-down.svg")}
              />
            </DropdownToggle>
            <DropdownMenu className={style.dropdownMenu}>
              <DropdownItem
                active={newMnemonicConfig.numWords === NumWords.WORDS12}
                onClick={() => newMnemonicConfig.setNumWords(NumWords.WORDS12)}
                className={style.dropdownItem}
              >
                <FormattedMessage id="register.create.toggle.word12" />
              </DropdownItem>
              <DropdownItem
                active={newMnemonicConfig.numWords === NumWords.WORDS24}
                onClick={() => newMnemonicConfig.setNumWords(NumWords.WORDS24)}
                className={style.dropdownItem}
              >
                <FormattedMessage id="register.create.toggle.word24" />
              </DropdownItem>
            </DropdownMenu>
          </ButtonDropdown>
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
        <div className={style.newMnemonic}>{newMnemonicConfig.mnemonic}</div>
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
        <div className={style.submitButton}>
          <Button color="primary" type="submit">
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

  const { analyticsStore } = useStore();

  return (
    <div>
      <div style={{ minHeight: "153px" }}>
        <div className={style.buttons}>
          {suggestedWords.map((word, i) => {
            return (
              <Button
                color="gray"
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
                color="gray"
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
      <div
        className={style.submitButton}
        style={{
          marginTop: "30px",
        }}
      >
        <Button
          color="primary"
          type="submit"
          disabled={suggestedWords.join(" ") !== wordsSlice.join(" ")}
          onClick={async (e) => {
            e.preventDefault();

            try {
              await registerConfig.createMnemonic(
                newMnemonicConfig.name,
                newMnemonicConfig.mnemonic,
                newMnemonicConfig.password,
                bip44Option.bip44HDPath
              );
              analyticsStore.setUserProperties({
                registerType: "seed",
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
      </div>
      <BackButton
        onClick={() => {
          newMnemonicConfig.setMode("generate");
        }}
      />
    </div>
  );
});
