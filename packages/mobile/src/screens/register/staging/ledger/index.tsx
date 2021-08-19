import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { useStyle } from "../../../../styles";
import { useSmartNavigation } from "../../../../navigation";
import { Controller, useForm } from "react-hook-form";
import { PageWithScrollView } from "../../../../components/staging/page";
import { TextInput } from "../../../../components/staging/input";
import { View } from "react-native";
import { Button } from "../../../../components/staging/button";

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const NewLedgerScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
        }
      >,
      string
    >
  >();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const registerConfig: RegisterConfig = route.params.registerConfig;
  const [mode] = useState(registerConfig.mode);

  const {
    control,
    handleSubmit,
    setFocus,
    getValues,
    formState: { errors },
  } = useForm<FormData>();

  const [isCreating, setIsCreating] = useState(false);

  const submit = handleSubmit(async () => {
    setIsCreating(true);

    try {
      await registerConfig.createLedger(
        getValues("name"),
        getValues("password"),
        {
          account: 0,
          change: 0,
          addressIndex: 0,
        }
      );

      smartNavigation.reset({
        index: 0,
        routes: [
          {
            name: "Register.End",
          },
        ],
      });
    } catch (e) {
      // Definitely, the error can be thrown when the ledger connection failed
      console.log(e);
      setIsCreating(false);
    }
  });

  return (
    <PageWithScrollView
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-12", "padding-bottom-12"])}
    >
      <Controller
        control={control}
        rules={{
          required: "Name is required",
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Account Name"
              returnKeyType={mode === "add" ? "done" : "next"}
              onSubmitEditing={() => {
                if (mode === "add") {
                  submit();
                }
                if (mode === "create") {
                  setFocus("password");
                }
              }}
              error={errors.name?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
            />
          );
        }}
        name="name"
        defaultValue=""
      />
      {mode === "create" ? (
        <React.Fragment>
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
              required: "Confirm Password is required",
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
                  label="Confirm Password"
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
        </React.Fragment>
      ) : null}
      <View style={style.flatten(["flex-1"])} />
      <Button text="Next" size="large" loading={isCreating} onPress={submit} />
    </PageWithScrollView>
  );
});
