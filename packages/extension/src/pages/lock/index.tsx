import React, { FunctionComponent, useState } from "react";

import { Input } from "../../components/form";

import { Button, Form } from "reactstrap";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Banner } from "../../components/banner";
import useForm from "react-hook-form";

import { EmptyLayout } from "../../layouts/empty-layout";

import style from "./style.module.scss";

import { FormattedMessage, useIntl } from "react-intl";
import { useInteractionInfo } from "@keplr/hooks";
import { useHistory } from "react-router";

interface FormData {
  password: string;
}

export const LockPage: FunctionComponent = observer(() => {
  const intl = useIntl();
  const history = useHistory();

  const interactionInfo = useInteractionInfo();

  const { register, handleSubmit, setError, errors } = useForm<FormData>({
    defaultValues: {
      password: "",
    },
  });

  const { keyRingStore } = useStore();
  const [loading, setLoading] = useState(false);

  return (
    <EmptyLayout style={{ backgroundColor: "white", height: "100%" }}>
      <Form
        className={style.formContainer}
        onSubmit={handleSubmit(async (data) => {
          setLoading(true);
          try {
            await keyRingStore.unlock(data.password);
            if (interactionInfo.interaction) {
              if (!interactionInfo.interactionInternal) {
                window.close();
              } else {
                history.replace("/");
              }
            }
          } catch (e) {
            console.log("Fail to decrypt: " + e.message);
            setError(
              "password",
              "invalid",
              intl.formatMessage({
                id: "lock.input.password.error.invalid",
              })
            );
            setLoading(false);
          }
        })}
      >
        <Banner
          icon={require("../../public/assets/temp-icon.svg")}
          logo={require("../../public/assets/logo-temp.png")}
          subtitle="Wallet for the Interchain"
        />
        <Input
          type="password"
          label={intl.formatMessage({
            id: "lock.input.password",
          })}
          name="password"
          error={errors.password && errors.password.message}
          ref={register({
            required: intl.formatMessage({
              id: "lock.input.password.error.required",
            }),
          })}
        />
        <Button type="submit" color="primary" block data-loading={loading}>
          <FormattedMessage id="lock.button.unlock" />
        </Button>
      </Form>
    </EmptyLayout>
  );
});
