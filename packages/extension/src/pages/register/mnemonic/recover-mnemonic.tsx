import { RegisterConfig } from "@keplr-wallet/hooks";
import { Buffer } from "buffer/";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import useForm from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Button,
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormGroup,
} from "reactstrap";
import { Input, MnemonicInput, PasswordInput } from "../../../components/form";
import { useStore } from "../../../stores";
import { AdvancedBIP44Option, useBIP44Option } from "../advanced-bip44";
import { BackButton } from "../index";
import style from "../style.module.scss";

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const bip39 = require("bip39");

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
      color="secondary"
      size="lg"
      block
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

  const [mnemonicInputValues, setMnemonicInputValues] = useState<string[]>([]);

  // TODO: need to make dynamic;
  const numWords = 12;

  const [isOpenWordsDropdown, setIsOpenWordsDropdown] = useState(false);

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

  const handlePasteClipboard = (event: any) => {
    const pastingValue: string = event.clipboardData.getData("text");
    const trimmedValue: string = trimWordsStr(pastingValue);
    setMnemonicInputValues(trimmedValue.split(" "));

    event.preventDefault();
  };

  useEffect(() => {
    // Initialize mnemonic input prop after pasted
    if (mnemonicInputValues.length > 0) {
      setMnemonicInputValues([]);
    }
  }, [mnemonicInputValues]);

  return (
    <React.Fragment>
      <div>
        <div className={style.title}>
          {intl.formatMessage({
            id: "register.private-key",
          })}
          <div>
            <ButtonDropdown
              isOpen={isOpenWordsDropdown}
              toggle={() => setIsOpenWordsDropdown(!isOpenWordsDropdown)}
            >
              <DropdownToggle className={style.dropdownToggle}>
                {/* {newMnemonicConfig.numWords === NumWords.WORDS12 ? (
                  <FormattedMessage id="register.create.toggle.word12" />
                ) : (
                  <FormattedMessage id="register.create.toggle.word24" />
                )} */}

                <FormattedMessage id="register.private-key" />
                <img
                  src={require("../../../public/assets/img/chevron-down.svg")}
                />
              </DropdownToggle>
              <DropdownMenu className={style.dropdownMenu}>
                <DropdownItem
                  // active={newMnemonicConfig.numWords === NumWords.WORDS12}
                  // onClick={() => newMnemonicConfig.setNumWords(NumWords.WORDS12)}
                  className={style.dropdownItem}
                >
                  <FormattedMessage id="register.create.toggle.word12" />
                </DropdownItem>
                <DropdownItem
                  // active={newMnemonicConfig.numWords === NumWords.WORDS24}
                  // onClick={() => newMnemonicConfig.setNumWords(NumWords.WORDS24)}
                  className={style.dropdownItem}
                >
                  <FormattedMessage id="register.create.toggle.more-than12" />
                </DropdownItem>
                <DropdownItem
                  // active={newMnemonicConfig.numWords === NumWords.WORDS24}
                  // onClick={() => newMnemonicConfig.setNumWords(NumWords.WORDS24)}
                  className={style.dropdownItem}
                >
                  <FormattedMessage id="register.private-key" />
                </DropdownItem>
              </DropdownMenu>
            </ButtonDropdown>
          </div>
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
          {
            <FormGroup className={style.mnemonicInputGroups}>
              {Array.from(Array(numWords).keys(), (i) => i + 1).map((index) => (
                <MnemonicInput
                  key={index}
                  index={index}
                  pastingValue={mnemonicInputValues[index - 1]}
                  handlePasteClipboard={handlePasteClipboard}
                />
              ))}
            </FormGroup>
          }
          {/* <TextArea
            type="password"
            className={style.mnemonic}
            placeholder={intl.formatMessage({
              id: "register.create.textarea.mnemonic.place-holder",
            })}
            name="words"
            rows={3}
            ref={register({
              required: "Mnemonic is required",
              validate: (value: string): string | undefined => {
                if (!isPrivateKey(value)) {
                  value = trimWordsStr(value);
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
                } else {
                  value = value.replace("0x", "");
                  if (value.length !== 64) {
                    return intl.formatMessage({
                      id:
                        "register.import.textarea.private-key.error.invalid-length",
                    });
                  }

                  try {
                    if (
                      Buffer.from(value, "hex")
                        .toString("hex")
                        .toLowerCase() !== value.toLowerCase()
                    ) {
                      return intl.formatMessage({
                        id:
                          "register.import.textarea.private-key.error.invalid",
                      });
                    }
                  } catch {
                    return intl.formatMessage({
                      id: "register.import.textarea.private-key.error.invalid",
                    });
                  }
                }
              },
            })}
            error={errors.words && errors.words.message}
          /> */}
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
            <Button
              color="primary"
              type="submit"
              size="lg"
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
