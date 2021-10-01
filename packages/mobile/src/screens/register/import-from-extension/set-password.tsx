import React, { FunctionComponent, useState } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { PageWithScrollView } from "../../../components/page";
import { View } from "react-native";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation";
import { ExportKeyRingData } from "@keplr-wallet/background";
import { Controller, useForm } from "react-hook-form";
import {
  registerExportedAddressBooks,
  registerExportedKeyRingDatas,
} from "../../../utils/import-from-mobile";
import {
  AddressBookConfigMap,
  AddressBookData,
  RegisterConfig,
} from "@keplr-wallet/hooks";
import { TextInput } from "../../../components/input";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { AsyncKVStore } from "../../../common";

interface FormData {
  password: string;
  confirmPassword: string;
}

export const ImportFromExtensionSetPasswordScreen: FunctionComponent = observer(
  () => {
    const { chainStore, keyRingStore } = useStore();

    const [addressBookConfigMap] = useState(
      () =>
        new AddressBookConfigMap(new AsyncKVStore("address_book"), chainStore)
    );

    const route = useRoute<
      RouteProp<
        Record<
          string,
          {
            registerConfig: RegisterConfig;
            exportKeyRingDatas: ExportKeyRingData[];
            addressBooks: { [chainId: string]: AddressBookData[] | undefined };
          }
        >,
        string
      >
    >();

    const smartNavigation = useSmartNavigation();

    const style = useStyle();

    const [isCreating, setIsCreating] = useState(false);

    const {
      control,
      handleSubmit,
      setFocus,
      getValues,
      formState: { errors },
    } = useForm<FormData>();

    const submit = handleSubmit(async () => {
      setIsCreating(true);

      try {
        await registerExportedKeyRingDatas(
          keyRingStore,
          route.params.registerConfig,
          route.params.exportKeyRingDatas,
          getValues("password")
        );

        await registerExportedAddressBooks(
          addressBookConfigMap,
          route.params.addressBooks
        );

        smartNavigation.reset({
          index: 0,
          routes: [
            {
              name: "Register.End",
              params: {
                password: getValues("password"),
              },
            },
          ],
        });
      } catch (e) {
        console.log(e);
        smartNavigation.goBack();
      }
    });

    return (
      <PageWithScrollView
        contentContainerStyle={style.get("flex-grow-1")}
        style={style.flatten(["padding-x-page"])}
      >
        <Controller
          control={control}
          rules={{
            required: "Password is required",
            validate: (value: string) => {
              if (value.length < 8) {
                return "Password must be longer than 8 characters";
              }
            },
          }}
          render={({ field: { onChange, onBlur, value, ref } }) => {
            return (
              <TextInput
                label="Password"
                returnKeyType="next"
                secureTextEntry={true}
                onSubmitEditing={() => {
                  setFocus("confirmPassword");
                }}
                error={errors.password?.message}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                ref={ref}
              />
            );
          }}
          name="password"
          defaultValue=""
        />
        <Controller
          control={control}
          rules={{
            required: "Confirm password is required",
            validate: (value: string) => {
              if (value.length < 8) {
                return "Password must be longer than 8 characters";
              }

              if (getValues("password") !== value) {
                return "Password doesn't match";
              }
            },
          }}
          render={({ field: { onChange, onBlur, value, ref } }) => {
            return (
              <TextInput
                label="Confirm password"
                returnKeyType="done"
                secureTextEntry={true}
                onSubmitEditing={() => {
                  submit();
                }}
                error={errors.confirmPassword?.message}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                ref={ref}
              />
            );
          }}
          name="confirmPassword"
          defaultValue=""
        />
        <View style={style.get("flex-1")} />
        <Button
          text="Next"
          size="large"
          loading={isCreating}
          onPress={submit}
        />
        {/* Mock element for bottom padding */}
        <View style={style.flatten(["height-page-pad"])} />
      </PageWithScrollView>
    );
  }
);
