import React, { FunctionComponent, useState, useEffect, useMemo } from "react";
import { HeaderLayout } from "@layouts/index";

import { useNavigate, useParams } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { Input } from "@components/form";
import { Button, Form } from "reactstrap";
import { useForm } from "react-hook-form";
import { useStore } from "../../../../stores";
import { observer } from "mobx-react-lite";

import styleName from "./name.module.scss";
import { KeyRingStatus } from "@keplr-wallet/background";

interface FormData {
  name: string;
}

export const ChangeNamePage: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const { index = "-1 " } = useParams<{ index: string }>();

  const intl = useIntl();

  const { keyRingStore, analyticsStore } = useStore();

  const waitingNameData = keyRingStore.waitingNameData?.data;

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
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
    return keyRingStore.multiKeyStoreInfo[parseInt(index)];
  }, [keyRingStore.multiKeyStoreInfo, index]);

  const isKeyStoreReady = keyRingStore.status === KeyRingStatus.UNLOCKED;

  useEffect(() => {
    if (parseInt(index).toString() !== index) {
      throw new Error("Invalid keyring index, check the url");
    }
  }, [index]);

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
        analyticsStore.logEvent("back_click", {
          pageName: "Change Account Name",
        });
        navigate(-1);
      }}
    >
      <Form
        className={styleName["container"]}
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
              parseInt(index),
              data.name.trim()
            );
            analyticsStore.logEvent("save_account_name_click");
            navigate("/");
          } catch (e) {
            console.log("Fail to decrypt: " + e.message);
            setError("name", {
              message: intl.formatMessage({
                id: "setting.keyring.change.input.name.error.invalid",
              }),
            });
            setLoading(false);
          }
        })}
      >
        <Input
          type="text"
          label={intl.formatMessage({
            id: "setting.keyring.change.previous-name",
          })}
          value={keyStore?.meta?.["name"] ?? ""}
          readOnly={true}
        />
        <Input
          type="text"
          label={intl.formatMessage({
            id: "setting.keyring.change.input.name",
          })}
          error={errors.name && errors.name.message}
          {...register("name", {
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
