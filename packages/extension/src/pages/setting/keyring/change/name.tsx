import React, { FunctionComponent, useState, useEffect, useMemo } from "react";
import { HeaderLayout } from "@layouts/index";

import { useHistory, useRouteMatch } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { Input } from "@components/form";
import { Button, Form } from "reactstrap";
import useForm from "react-hook-form";
import { useStore } from "../../../../stores";
import { observer } from "mobx-react-lite";

import styleName from "./name.module.scss";
import { KeyRingStatus } from "@keplr-wallet/background";

interface FormData {
  name: string;
}

export const ChangeNamePage: FunctionComponent = observer(() => {
  const history = useHistory();
  const match = useRouteMatch<{ index: string }>();

  const intl = useIntl();

  const { keyRingStore } = useStore();

  const waitingNameData = keyRingStore.waitingNameData?.data;

  const {
    register,
    handleSubmit,
    errors,
    setError,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (waitingNameData?.defaultName) {
      setValue("name", waitingNameData.defaultName);
    }
  }, [waitingNameData, setValue]);

  const [loading, setLoading] = useState(false);

  const keyStore = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo[parseInt(match.params.index)];
  }, [keyRingStore.multiKeyStoreInfo, match.params.index]);

  const isKeyStoreReady = keyRingStore.status === KeyRingStatus.UNLOCKED;

  useEffect(() => {
    if (parseInt(match.params.index).toString() !== match.params.index) {
      throw new Error("Invalid keyring index, check the url");
    }
  }, [match.params.index]);

  if (isKeyStoreReady && keyStore == null) {
    return null;
  }

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.keyring.change.name",
      })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <Form
        className={styleName.container}
        onSubmit={handleSubmit(async (data) => {
          setLoading(true);
          try {
            // Close the popup by external change name message
            if (waitingNameData != null) {
              await keyRingStore.approveChangeName(data.name);
              window.close();
              return;
            }

            // Make sure that name is changed
            await keyRingStore.updateNameKeyRing(
              parseInt(match.params.index),
              data.name.trim()
            );

            history.push("/");
          } catch (e) {
            console.log("Fail to decrypt: " + e.message);
            setError(
              "name",
              "invalid",
              intl.formatMessage({
                id: "setting.keyring.change.input.name.error.invalid",
              })
            );
            setLoading(false);
          }
        })}
      >
        <Input
          type="text"
          label={intl.formatMessage({
            id: "setting.keyring.change.previous-name",
          })}
          value={keyStore?.meta?.name ?? ""}
          readOnly={true}
        />
        <Input
          type="text"
          label={intl.formatMessage({
            id: "setting.keyring.change.input.name",
          })}
          name="name"
          error={errors.name && errors.name.message}
          ref={register({
            required: intl.formatMessage({
              id: "setting.keyring.change.input.name.error.required",
            }),
          })}
          maxLength={20}
          readOnly={waitingNameData !== undefined && !waitingNameData?.editable}
        />

        <div style={{ flex: 1 }} />
        <Button type="submit" color="primary" block data-loading={loading}>
          <FormattedMessage id="setting.keyring.change.name.button.save" />
        </Button>
      </Form>
    </HeaderLayout>
  );
});
