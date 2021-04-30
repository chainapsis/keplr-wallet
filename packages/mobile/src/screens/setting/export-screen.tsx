import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { FullPage } from "../../components/page";
import { Card } from "react-native-elements";
import { Text } from "react-native-elements";
import { useStore } from "../../stores";
import { useForm, Controller } from "react-hook-form";
import { flowResult } from "mobx";
import { Input } from "../../components/input";
import { Button } from "../../components/buttons";

interface FormData {
  password: string;
}

export const ExportScreen: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const [loading, setLoading] = useState(false);
  const [keyRing, setKeyRing] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async ({ password }: FormData) => {
    setLoading(true);
    try {
      const selectedIndex = keyRingStore.multiKeyStoreInfo.findIndex(
        (keyRing) => keyRing.selected === true
      );
      setKeyRing(
        await flowResult(keyRingStore.showKeyRing(selectedIndex, password))
      );
    } catch (e) {
      console.log("Fail to decrypt: " + e.message);
      setError("password", { type: "invalid", message: "Invaild password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FullPage>
      {keyRing ? (
        <Card>
          <Text>{keyRing}</Text>
        </Card>
      ) : (
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
          <Button
            loading={loading}
            title="Confirm"
            onPress={handleSubmit(onSubmit)}
          />
        </React.Fragment>
      )}
    </FullPage>
  );
});
