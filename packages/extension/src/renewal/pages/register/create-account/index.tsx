import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import styled from "styled-components";
import { Button } from "../../../components/button";
import { ButtonSelect } from "../../../components/button-select";
import { Gutter } from "../../../components/gutter";
import { CheckIcon } from "../../../components/icon";
import { Input } from "../../../components/input";
import { Stack } from "../../../components/stack";
import { Tiles } from "../../../components/tiles";
import { useSimpleTimer } from "../../../hooks/use-simple-timer";
import { ColorPalette } from "../../../styles";
import { NewMnemonicConfig, NumWords, useNewMnemonicConfig } from "./hook";
import useForm from "react-hook-form";
import { useStore } from "../../../../stores";

export const CreateAccountType = "new-mnemonic";

interface CreateAccountProps {
  registerConfig: RegisterConfig;
}

export const CreateAccount: FunctionComponent<CreateAccountProps> = observer(
  ({ registerConfig }: { registerConfig: RegisterConfig }) => {
    const [step, setStep] = useState<1 | 2>(1);

    const intl = useIntl();

    const newMnemonicConfig = useNewMnemonicConfig(registerConfig);

    const goNextStep = () => setStep(2);

    return (
      <Stack gutter="2rem" alignItems="center">
        <Title>
          {intl.formatMessage({
            id: "register.create.title",
          })}
        </Title>
        {step === 1 && (
          <StepOne
            newMnemonicConfig={newMnemonicConfig}
            goNextStep={goNextStep}
          />
        )}
        {step === 2 && (
          <StepTwo
            newMnemonicConfig={newMnemonicConfig}
            registerConfig={registerConfig}
          />
        )}
      </Stack>
    );
  }
);

interface StepOneProps {
  newMnemonicConfig: NewMnemonicConfig;
  goNextStep: () => void;
}

const StepOne: FunctionComponent<StepOneProps> = observer(
  ({ newMnemonicConfig, goNextStep }) => {
    const intl = useIntl();
    const { isTimedOut, setTimer } = useSimpleTimer();

    return (
      <Stack gutter="2rem" alignItems="center">
        <BackupWarning>
          <BackupWarningTitle>
            Backup your mnemonic seed securely.
          </BackupWarningTitle>
          <BackupWarningList>
            <li>Anyone with your mnemonic seed can take your assets.</li>
            <li>{"Lost mnemonic seed can't be recovered"}</li>
          </BackupWarningList>
        </BackupWarning>
        <ButtonSelect<NumWords>
          items={[
            {
              id: NumWords.WORDS12,
              label: intl.formatMessage({
                id: "register.create.toggle.word12",
              }),
            },
            {
              id: NumWords.WORDS24,
              label: intl.formatMessage({
                id: "register.create.toggle.word24",
              }),
            },
          ]}
          activeItemId={newMnemonicConfig.numWords}
          onClickItem={(itemId: NumWords) => {
            console.log(itemId);
            if (newMnemonicConfig.numWords !== itemId) {
              newMnemonicConfig.setNumWords(itemId);
            }
          }}
        />
        <Tiles columns={3} space="16px">
          {newMnemonicConfig.mnemonic.split(" ").map((mnemonicWord, index) => (
            <Input
              key={index}
              label={`${index + 1}.`}
              value={mnemonicWord}
              readOnly
              isInline
            />
          ))}
        </Tiles>
        <Gutter size="1rem" />
        <Button
          variant="transparent"
          color={!isTimedOut ? "primary" : "success"}
          onClick={() => {
            setTimer(3000);
          }}
          rightIcon={isTimedOut ? <CheckIcon /> : undefined}
        >
          <SemiboldText>Copy to clipboard</SemiboldText>
        </Button>
        <Gutter size="3.125rem" />
        <Button variant="solid" color="secondary" size="md" onClick={() => {}}>
          Change BIP Path
        </Button>
        <Gutter size="1rem" />
        <Button
          variant="solid"
          color="primary"
          size="block"
          onClick={goNextStep}
        >
          Next
        </Button>
      </Stack>
    );
  }
);

const RandomPickNumber: number = 2;

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

interface StepTwoProps {
  newMnemonicConfig: NewMnemonicConfig;
  registerConfig: RegisterConfig;
}

const StepTwo: FunctionComponent<StepTwoProps> = observer(
  ({ newMnemonicConfig, registerConfig }) => {
    const { analyticsStore } = useStore();

    const intl = useIntl();

    const [candidateWords, setCandidateWords] = useState<string[]>(
      Array(RandomPickNumber).fill("")
    );

    const { register, getValues } = useForm<FormData>({
      defaultValues: {
        name: "",
        password: "",
        confirmPassword: "",
      },
    });

    const randomMnemonicWords = useMemo(() => {
      const mnemonicWords = newMnemonicConfig.mnemonic.split(" ");
      const mnemonicWordsWithIndex = mnemonicWords.map((word, index) => ({
        word,
        index,
      }));
      const shuffled = mnemonicWordsWithIndex.sort(() => 0.5 - Math.random());

      return shuffled.slice(0, RandomPickNumber);
    }, [newMnemonicConfig.mnemonic]);

    return (
      <Stack gutter="2rem" alignItems="center">
        <Description>
          Enter the select mnemonic words in the order provided.
        </Description>
        <VerifyMnemonicContainer>
          {randomMnemonicWords.map(({ index }) => (
            <Input
              key={index}
              type="text"
              label={`${index + 1}.`}
              value={candidateWords[index]}
              onChange={(e) =>
                setCandidateWords([
                  ...candidateWords.slice(0, index),
                  e.target.value,
                  ...candidateWords.slice(index + 1, candidateWords.length),
                ])
              }
              isInline
            />
          ))}
        </VerifyMnemonicContainer>
        <StyledForm>
          <Stack gutter="1.125rem">
            <Input
              label={intl.formatMessage({
                id: "register.name",
              })}
              name="name"
              ref={register({
                required: intl.formatMessage({
                  id: "register.name.error.required",
                }),
              })}
            />
            <Input
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
            />
            <Input
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
            />
          </Stack>
        </StyledForm>

        <Button variant="solid" color="secondary" size="md" onClick={() => {}}>
          Change BIP Path
        </Button>
        <Button
          variant="solid"
          color="primary"
          size="block"
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
        >
          <FormattedMessage id="register.verify.button.register" />
        </Button>
      </Stack>
    );
  }
);

const BackupWarning = styled.div`
  padding: 28px 32px;
  background-color: ${ColorPalette["red-50"]};
  border: 1.4px solid ${ColorPalette["red-300"]};
  border-radius: 16px;
`;
const BackupWarningTitle = styled.span`
  font-weight: 700;
  font-size: 16px;
  line-height: 23px;
  color: ${ColorPalette["red-300"]};
`;

const BackupWarningList = styled.ul`
  font-weight: 400;
  font-size: 16.7707px;
  line-height: 23px;
  color: ${ColorPalette["red-300"]};
`;

const Title = styled.h1`
  font-weight: 600;
  font-size: 32px;
  line-height: 44px;
  text-align: center;
  color: ${ColorPalette["platinum-500"]};
`;

const SemiboldText = styled.span`
  font-weight: 600;
`;

const Description = styled.p`
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;
  color: ${ColorPalette["gray-400"]};
`;

const VerifyMnemonicContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 25px 55px;
  gap: 16px;
  background: ${ColorPalette["gray-10"]};
  border-radius: 8px;
`;

const StyledForm = styled.form`
  width: 100%;
`;
