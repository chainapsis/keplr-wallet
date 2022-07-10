import React, { FunctionComponent, useState, useEffect, useMemo } from "react";
import { HeaderLayout } from "../../../../layouts";

import { useNavigate, useParams } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { Input } from "../../../../components/form";
import { Button, Form } from "reactstrap";
import useForm from "react-hook-form";
import { useStore } from "../../../../stores";
import { observer } from "mobx-react-lite";

import styleName from "./name.module.scss";
import { KeplrError } from "@keplr-wallet/router";

interface FormData {
  name: string;
}

export const ChangeNamePage: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const params = useParams() as { index: string };

  const intl = useIntl();

  const [loading, setLoading] = useState(false);

  const { keyRingStore } = useStore();
  const { register, handleSubmit, errors, setError } = useForm<FormData>({
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (parseInt(params.index).toString() !== params.index) {
      throw new KeplrError("keyring", 201, "Invalid index");
    }
  }, [params.index]);

  const keyStore = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo[parseInt(params.index)];
  }, [keyRingStore.multiKeyStoreInfo, params.index]);

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.keyring.change.name",
      })}
      onBackButton={() => {
        navigate(-1);
      }}
    >
      <Form
        className={styleName.container}
        onSubmit={handleSubmit(async (data) => {
          setLoading(true);
          try {
            // Make sure that name is changed
            await keyRingStore.updateNameKeyRing(
              parseInt(params.index),
              data.name
            );
            navigate("/");
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
          value={keyStore.meta?.name}
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
        />
        <div style={{ flex: 1 }} />
        <Button type="submit" color="primary" block data-loading={loading}>
          <FormattedMessage id="setting.keyring.change.name.button.save" />
        </Button>
      </Form>
    </HeaderLayout>
  );
});
