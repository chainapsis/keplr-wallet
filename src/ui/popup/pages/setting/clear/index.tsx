import React, { FunctionComponent, useCallback, useState } from "react";
import { HeaderLayout } from "../../../layouts/header-layout";

import { useHistory } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { Input } from "../../../../components/form";
import { Button, Form } from "reactstrap";
import useForm from "react-hook-form";
import { useStore } from "../../../stores";
import { observer } from "mobx-react";

import style from "./style.module.scss";
import { WarningView } from "./warning-view";

interface FormData {
  password: string;
}

export const ClearPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const intl = useIntl();

  const [loading, setLoading] = useState(false);

  const { keyRingStore } = useStore();
  const { register, handleSubmit, setError, errors } = useForm<FormData>({
    defaultValues: {
      password: ""
    }
  });

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.clear"
      })}
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      <div className={style.container}>
        <WarningView />
        <Form
          onSubmit={handleSubmit(async data => {
            setLoading(true);
            try {
              await keyRingStore.clear(data.password);
              history.push("/");
            } catch (e) {
              console.log("Fail to decrypt: " + e.message);
              setError(
                "password",
                "invalid",
                intl.formatMessage({
                  id: "setting.clear.input.password.error.invalid"
                })
              );
              setLoading(false);
            }
          })}
        >
          <Input
            type="password"
            label={intl.formatMessage({
              id: "setting.clear.input.password"
            })}
            name="password"
            error={errors.password && errors.password.message}
            ref={register({
              required: intl.formatMessage({
                id: "setting.clear.input.password.error.required"
              })
            })}
          />
          <Button type="submit" color="primary" block data-loading={loading}>
            <FormattedMessage id="setting.clear.button.confirm" />
          </Button>
        </Form>
      </div>
    </HeaderLayout>
  );
});
