import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { FormattedMessage, useIntl } from "react-intl";
import { useForm } from "react-hook-form";
import {
  AdvancedBIP44Option,
  BIP44Option,
  useBIP44Option,
} from "../advanced-bip44";
import style from "../style.module.scss";
import style2 from "./recover-mnemonic.module.scss";
import { Button, Form, Label } from "reactstrap";
import { Input, PasswordInput } from "@components-v2/form";
import { BackButton } from "../index";
import {
  NewMnemonicConfig,
  NewMnemonicStep,
  NumWords,
  useNewMnemonicConfig,
} from "./hook";
import { useStore } from "../../../stores";
import { ButtonV2 } from "@components-v2/buttons/button";
import { useNotification } from "@components/notification";
import { AuthIntro } from "../auth";
import { Card } from "@components-v2/card";
import keyIcon from "@assets/svg/wireframe/key-icon.png";
import { TabsPanel } from "@components-v2/tabs/tabsPanel-2";

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
    <React.Fragment>
      {" "}
      <img
        style={{ width: "450px" }}
        src={require("@assets/svg/wireframe/Title.svg")}
        alt="logo"
      />
      <div className={style["titleText"]}>Choose how you want to proceed</div>
      <div
        className={style["card"]}
        onClick={(e: any) => {
          e.preventDefault();

          registerConfig.setType(TypeNewMnemonic);
          analyticsStore.logEvent("Create account started", {
            registerType: "seed",
          });
        }}
      >
        <img src={require("@assets/svg/wireframe/plus-icon.svg")} alt="" />
        <div>
          <div className={style["cardTitle"]}>Create a new wallet </div>
          <div className={style["cardText"]}>
            Create a wallet to store, send, receive and invest in thousands of
            crypto assets
          </div>
        </div>
      </div>
    </React.Fragment>
  );
});

export const NewMnemonicPage: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const newMnemonicConfig = useNewMnemonicConfig(registerConfig);
  const bip44Option = useBIP44Option();
  const [isMainPage, setIsMainPage] = useState(true);
  const { analyticsStore } = useStore();
  const [continueClicked, setContinueClicked] = useState(false);

  return (
    <React.Fragment>
      {isMainPage && (
        <React.Fragment>
          <BackButton
            onClick={() => {
              registerConfig.clear();
            }}
          />
          <div className={style["pageTitle"]}>Create a new wallet</div>
          {/* <div className={style["newMnemonicText"]}>
            Enter your password to sign in
          </div> */}
          <AuthIntro registerConfig={registerConfig} />
          <Card
            leftImageStyle={{ height: "32px", width: "32px" }}
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              height: "78px",
              fontSize: "14px",
            }}
            onClick={(e: any) => {
              e.preventDefault();
              setIsMainPage(false);
              registerConfig.setType(TypeNewMnemonic);
              analyticsStore.logEvent("Create account started", {
                registerType: "seed",
              });
            }}
            leftImage={keyIcon}
            heading={"Create new seed phrase"}
          />

          <div onClick={() => setIsMainPage(false)} />
        </React.Fragment>
      )}
      {!isMainPage && newMnemonicConfig.mode === "generate" ? (
        <GenerateMnemonicModePage
          registerConfig={registerConfig}
          newMnemonicConfig={newMnemonicConfig}
          bip44Option={bip44Option}
          isMainPage={isMainPage}
          continueClicked={continueClicked}
          setContinueClicked={setContinueClicked}
        />
      ) : null}
      {!isMainPage && newMnemonicConfig.mode === "verify" ? (
        <VerifyMnemonicModePage
          registerConfig={registerConfig}
          newMnemonicConfig={newMnemonicConfig}
          bip44Option={bip44Option}
          setContinueClicked={setContinueClicked}
        />
      ) : null}
    </React.Fragment>
  );
});

interface GenerateMnemonicModePageProps {
  registerConfig: RegisterConfig;
  newMnemonicConfig: NewMnemonicConfig;
  bip44Option: BIP44Option;
  isMainPage: boolean;
  continueClicked: boolean;
  setContinueClicked: any;
}
export const GenerateMnemonicModePage: React.FC<GenerateMnemonicModePageProps> =
  observer(
    ({
      registerConfig,
      newMnemonicConfig,
      bip44Option,
      isMainPage,
      continueClicked,
      setContinueClicked,
    }) => {
      const intl = useIntl();
      const notification = useNotification();
      const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
      } = useForm<FormData>({
        defaultValues: {
          name: newMnemonicConfig.name,
          words: newMnemonicConfig.mnemonic,
          password: "",
          confirmPassword: "",
        },
      });

      const tabs = [
        { id: NewMnemonicStep.WORDS12 },
        { id: NewMnemonicStep.WORDS24 },
      ];
      const [checkBox1Checked, setCheckBox1Checked] = useState(false);
      const [checkBox2Checked, setCheckBox2Checked] = useState(false);

      const [activeTab, setActiveTab] = useState(tabs[0].id);

      useEffect(() => {
        const handleTabChange = (activeTab: string) => {
          if (activeTab === NewMnemonicStep.WORDS12)
            newMnemonicConfig.setNumWords(NumWords.WORDS12);
          else newMnemonicConfig.setNumWords(NumWords.WORDS24);
        };

        handleTabChange(activeTab);
      }, [activeTab]);

      const handleCopyClicked = useCallback(async () => {
        await navigator.clipboard.writeText(newMnemonicConfig.mnemonic);
        notification.push({
          placement: "top-center",
          type: "success",
          duration: 2,
          content: "Copied Mnemonic",
          canDelete: true,
          transition: {
            duration: 0.25,
          },
        });
      }, []);

      return (
        <div>
          {!isMainPage && !continueClicked ? (
            <div>
              <BackButton
                onClick={() => {
                  registerConfig.clear();
                }}
              />
              <div
                style={{
                  marginTop: "24px",
                }}
              >
                <div style={{ color: "white", fontSize: "32px" }}>
                  Save your recovery
                </div>
                <div style={{ color: "white", fontSize: "32px" }}> phrase</div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "16px",
                    marginTop: "12px",
                  }}
                >
                  These words below will let you recover your wallet if you lose
                  your device. We recommend writing down your recovery phrase
                  and storing it in a secure offline location, and never share
                  with anyone!
                </div>
              </div>

              <TabsPanel
                tabs={tabs}
                setActiveTab={setActiveTab}
                styleProps={{
                  width: "165px",
                  height: "36px",
                }}
              />

              <div className={style["newMnemonicContainer"]}>
                <div className={style["newMnemonic"]}>
                  {newMnemonicConfig.mnemonic}
                </div>
                <img
                  className={style["copyImage"]}
                  onClick={handleCopyClicked}
                  src={require("@assets/svg/wireframe/copy.svg")}
                  alt=""
                />
              </div>
              <label className={style["checkbox"]}>
                <input
                  type="checkbox"
                  checked={checkBox1Checked}
                  onChange={() => setCheckBox1Checked(!checkBox1Checked)}
                />{" "}
                I understand that if I lose my recovery phrase, I will not be
                able to access my wallet.
              </label>
              <label className={style["checkbox"]}>
                {" "}
                <input
                  type="checkbox"
                  checked={checkBox2Checked}
                  onChange={() => setCheckBox2Checked(!checkBox2Checked)}
                />{" "}
                I understand that my assets can be stolen if I share my recovery
                phrase with someone else.
              </label>
              <AdvancedBIP44Option bip44Option={bip44Option} />
              <ButtonV2
                styleProps={{ marginBottom: "20px", height: "56px" }}
                disabled={!checkBox1Checked || !checkBox2Checked}
                onClick={() => setContinueClicked(true)}
                text=""
              >
                Continue
              </ButtonV2>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                width: "333px",
                marginLeft: "7%",
              }}
            >
              <BackButton
                onClick={() => {
                  setContinueClicked(false);
                }}
              />
              <div className={style["pageTitle"]}>Create a new wallet</div>
              <div className={style["newMnemonicText"]}>
                To keep your account safe, avoid any personal information or
                words
              </div>
              <Form
                className={style["formContainer"]}
                onSubmit={handleSubmit(async (data: FormData) => {
                  newMnemonicConfig.setName(data.name);
                  newMnemonicConfig.setPassword(data.password);

                  newMnemonicConfig.setMode("verify");
                })}
              >
                <Label
                  for="name"
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontWeight: 400,
                    fontSize: "15px",
                  }}
                >
                  {intl.formatMessage({ id: "register.name" })}
                </Label>
                <Input
                  className={style2["addressInput"]}
                  type="text"
                  {...register("name", {
                    required: intl.formatMessage({
                      id: "register.name.error.required",
                    }),
                  })}
                  // error={errors.name && errors.name.message}
                  maxLength={20}
                  style={{
                    width: "333px !important",
                  }}
                />
                {errors.name && errors.name.message && (
                  <div className={style2["addressErrorText"]}>
                    address is required
                  </div>
                )}
                {registerConfig.mode === "create" ? (
                  <div style={{ marginTop: "-27px" }}>
                    <PasswordInput
                      {...register("password", {
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
                      passwordLabel="Confirm Password"
                      {...register("confirmPassword", {
                        required: intl.formatMessage({
                          id: "register.create.input.confirm-password.error.required",
                        }),
                        validate: (
                          confirmPassword: string
                        ): string | undefined => {
                          if (confirmPassword !== getValues()["password"]) {
                            return intl.formatMessage({
                              id: "register.create.input.confirm-password.error.unmatched",
                            });
                          }
                        },
                      })}
                      error={
                        errors.confirmPassword && errors.confirmPassword.message
                      }
                    />
                  </div>
                ) : null}
                <ButtonV2
                  disabled={!!errors.password?.message}
                  text={""}
                  styleProps={{ marginBottom: "20px", height: "56px" }}
                >
                  <FormattedMessage id="register.create.button.next" />
                </ButtonV2>
              </Form>
            </div>
          )}
        </div>
      );
    }
  );

export const VerifyMnemonicModePage: FunctionComponent<{
  registerConfig: RegisterConfig;
  newMnemonicConfig: NewMnemonicConfig;
  bip44Option: BIP44Option;
  setContinueClicked: any;
}> = observer(
  ({ registerConfig, newMnemonicConfig, bip44Option, setContinueClicked }) => {
    const wordsSlice = useMemo(() => {
      const words = newMnemonicConfig.mnemonic.split(" ");
      for (let i = 0; i < words.length; i++) {
        words[i] = words[i].trim();
      }
      return words;
    }, [newMnemonicConfig.mnemonic]);
    const [randomizedWords, setRandomizedWords] = useState<string[]>([]);
    const [suggestedWords, setSuggestedWords] = useState<string[]>([]);
    const [clickedButtons, setClickedButtons] = useState<number[]>([]);
    const [disabledButtons, setDisabledButtons] = useState<number[]>([]);

    const firstButtonsPerRow = randomizedWords.length > 12 ? 4 : 3;

    function chunkArray(array: any, size: any) {
      const chunkedArray = [];
      for (let i = 0; i < array.length; i += size) {
        chunkedArray.push(array.slice(i, i + size));
      }
      return chunkedArray;
    }

    const suggestedRows = chunkArray(suggestedWords, firstButtonsPerRow);

    useEffect(() => {
      const words = newMnemonicConfig.mnemonic.split(" ");
      for (let i = 0; i < words.length; i++) {
        words[i] = words[i].trim();
        suggestedWords.push(" ");
      }
      words.sort((word1, word2) => {
        return word1 > word2 ? 1 : -1;
      });
      setRandomizedWords(words);
    }, [newMnemonicConfig.mnemonic]);

    const { analyticsStore } = useStore();

    const handleClickFirstButton = (word: string, index: number) => {
      if (!clickedButtons.includes(index)) {
        const updatedSuggestedWords = [...suggestedWords];
        const updatedClickedButtons = [...clickedButtons];
        const updatedDisabledButtons = [...disabledButtons];

        // Update suggested word based on current state
        updatedSuggestedWords[index] =
          word === updatedSuggestedWords[index] ? " " : word;

        // Update clicked buttons based on the change
        if (updatedSuggestedWords[index] === " ") {
          // Remove button from clicked if clicked again (becomes empty)
          const existingIndex = updatedClickedButtons.indexOf(index);
          if (existingIndex !== -1) {
            updatedClickedButtons.splice(existingIndex, 1);
          }
        } else {
          // Add button to clicked if not already clicked
          if (!updatedClickedButtons.includes(index)) {
            updatedClickedButtons.push(index);
          }
        }

        // Update disabled buttons based on clicked buttons
        const buttonIndex = randomizedWords.indexOf(word);
        updatedDisabledButtons.splice(
          updatedDisabledButtons.indexOf(buttonIndex),
          updatedClickedButtons.includes(index) ? 0 : 1 // Enable if clicked, disable otherwise
        );

        setSuggestedWords(updatedSuggestedWords);
        setClickedButtons(updatedClickedButtons);
        setDisabledButtons(updatedDisabledButtons);
      }
    };

    const handleClickSecondButton = (index: number) => {
      const wordToAdd = randomizedWords[index];
      const firstEmptyButtonIndex = suggestedWords.findIndex(
        (word) => word === " "
      );

      if (firstEmptyButtonIndex !== -1) {
        const updatedSuggestedWords = [...suggestedWords];
        updatedSuggestedWords[firstEmptyButtonIndex] = wordToAdd;
        setSuggestedWords(updatedSuggestedWords);

        // Disable the clicked button instead of removing the word:
        setDisabledButtons([...disabledButtons, index]);
      }
    };
    return (
      <div>
        <BackButton
          onClick={() => {
            setContinueClicked(true);
            newMnemonicConfig.setMode("generate");
          }}
        />
        <div className={style["pageTitle"]}>
          Verify your recovery <br /> phrase
        </div>
        <div style={{ minHeight: "153px" }}>
          {suggestedRows.map((row, rowIndex) => (
            <div className={style["buttons"]} key={rowIndex}>
              {row.map((word: string, i: number) => (
                <Button
                  className={style["button"]}
                  key={word + i.toString()}
                  onClick={() =>
                    handleClickFirstButton(
                      word,
                      rowIndex * firstButtonsPerRow + i
                    )
                  }
                >
                  {word}
                </Button>
              ))}
            </div>
          ))}
        </div>
        <hr />
        <div>
          <div className={style["buttons"]}>
            {randomizedWords.map((word, i) => (
              <Button
                className={style["btn2"]}
                key={word + i.toString()}
                onClick={() => handleClickSecondButton(i)}
                disabled={disabledButtons.includes(i)}
              >
                {word}
              </Button>
            ))}
          </div>
        </div>

        <ButtonV2
          text=""
          disabled={
            registerConfig.isLoading ||
            suggestedWords.join(" ") !== wordsSlice.join(" ")
          }
          styleProps={{
            marginTop: "30px",
            marginBottom: "20px",
            height: "56px",
            borderRadius: "100px",
            background:
              registerConfig.isLoading ||
              suggestedWords.join(" ") !== wordsSlice.join(" ")
                ? "transparent"
                : "white",
          }}
          onClick={async (e: any) => {
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
        </ButtonV2>
      </div>
    );
  }
);
