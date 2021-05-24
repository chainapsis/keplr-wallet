import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { getRandomBytesAsync } from "../../../common";
import { useNavigation } from "@react-navigation/native";
import { FullPage } from "../../../components/page";
import { FlexButton } from "../../../components/buttons";
import { useForm, Controller } from "react-hook-form";
import { h2, mb2 } from "../../../styles";
import { Input } from "../../../components/input";
import * as Keychain from "react-native-keychain";

interface FormData {
  name: string;
  mnemonic: string;
  password: string;
  confirmPassword: string;
}

function isPrivateKey(str: string): boolean {
  if (str.startsWith("0x")) {
    return true;
  }

  return str.length === 64;
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

export const RecoverMnemonicScreen: FunctionComponent = observer(() => {
  const navigation = useNavigation();

  const { keyRingStore } = useStore();

  const registerConfig = useRegisterConfig(
    keyRingStore,
    [],
    getRandomBytesAsync
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      mnemonic: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async ({ name, mnemonic, password }: FormData) => {
    try {
      if (!isPrivateKey(mnemonic)) {
        await registerConfig.createMnemonic(
          name,
          trimWordsStr(mnemonic),
          password,
          {
            account: 0,
            change: 0,
            addressIndex: 0,
          }
        );
      } else {
        const privateKey = Buffer.from(
          mnemonic.trim().replace("0x", ""),
          "hex"
        );
        await registerConfig.createPrivateKey(name, privateKey, password);
      }
      if (password) {
        await Keychain.setGenericPassword("keplr", password, {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
          securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
        });
      }
      navigation.navigate("Main");
    } catch (e) {
      console.log(e.message ? e.message : e.toString());
      registerConfig.clear();
    }
  };

  return (
    <FullPage>
      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <Input
            label="Mnemonic"
            labelStyle={[h2, mb2]}
            autoCapitalize="none"
            value={value}
            multiline={true}
            numberOfLines={5}
            onChangeText={onChange}
            inputContainerStyle={[{ height: 150 }]}
            errorMessage={
              errors.mnemonic && errors.mnemonic.message
                ? errors.mnemonic.message
                : undefined
            }
          />
        )}
        name="mnemonic"
        rules={{
          required: { value: true, message: "Mnemonic is required" },
        }}
      />
      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <Input
            label="Name"
            value={value}
            onChangeText={onChange}
            errorMessage={
              errors.name && errors.name.message
                ? errors.name.message
                : undefined
            }
          />
        )}
        name="name"
        rules={{
          required: { value: true, message: "Name is required" },
        }}
      />
      {registerConfig.mode === "create" ? (
        <React.Fragment>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Password"
                autoCompleteType="password"
                secureTextEntry={true}
                value={value}
                onChangeText={onChange}
                errorMessage={
                  errors.password && errors.password.message
                    ? errors.password.message
                    : undefined
                }
              />
            )}
            name="password"
            rules={{
              required: { value: true, message: "Password is required" },
              minLength: { value: 8, message: "At least 8" },
            }}
          />
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Confirm password"
                autoCompleteType="password"
                secureTextEntry={true}
                value={value}
                onChangeText={onChange}
                errorMessage={
                  errors.confirmPassword && errors.confirmPassword.message
                    ? errors.confirmPassword.message
                    : undefined
                }
              />
            )}
            name="confirmPassword"
            rules={{
              required: {
                value: true,
                message: "Confirm Password is required",
              },
              minLength: { value: 8, message: "At least 8" },
              validate: (confirmPassword: string): string | undefined => {
                if (confirmPassword !== getValues()["password"]) {
                  return "password is not matched";
                }
              },
            }}
          />
        </React.Fragment>
      ) : null}
      <FlexButton
        title="Import"
        onPress={() => {
          handleSubmit(onSubmit)();
        }}
      />
    </FullPage>
  );
});
