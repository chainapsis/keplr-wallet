import React, { FunctionComponent, useEffect, useState } from "react";

import { Input } from "../../../components/form";

import { Button, Form } from "reactstrap";

import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { Banner } from "../../components/banner";
import useForm from "react-hook-form";

import { EmptyLayout } from "../../layouts/empty-layout";

import style from "./style.module.scss";
import queryString from "query-string";

import { FormattedMessage, useIntl } from "react-intl";
import {
  disableScroll,
  enableScroll,
  fitWindow
} from "../../../../common/window";
import { useLocation } from "react-router";

interface FormData {
  password: string;
}

export const LockPage: FunctionComponent = observer(() => {
  const location = useLocation();

  const intl = useIntl();

  const query = queryString.parse(location.search);
  const external = query.external ?? false;

  useEffect(() => {
    if (external) {
      fitWindow();
      disableScroll();
    } else {
      enableScroll();
    }
  }, [external]);

  const { register, handleSubmit, setError, errors } = useForm<FormData>({
    defaultValues: {
      password: ""
    }
  });

  const { keyRingStore } = useStore();
  const [loading, setLoading] = useState(false);

  return (
    <EmptyLayout style={{ backgroundColor: "white", height: "100%" }}>
      <Form
        className={style.formContainer}
        onSubmit={handleSubmit(async data => {
          setLoading(true);
          try {
            await keyRingStore.unlock(data.password);
            if (external) {
              window.close();
            }
          } catch (e) {
            console.log("Fail to decrypt: " + e.message);
            setError(
              "password",
              "invalid",
              intl.formatMessage({
                id: "lock.input.password.error.invalid"
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
            id: "lock.input.password"
          })}
          name="password"
          error={errors.password && errors.password.message}
          ref={register({
            required: intl.formatMessage({
              id: "lock.input.password.error.required"
            })
          })}
        />
        <Button type="submit" color="primary" block data-loading={loading}>
          <FormattedMessage id="lock.button.unlock" />
        </Button>
      </Form>
    </EmptyLayout>
  );
});
