import React, { FunctionComponent, useCallback, useState } from "react";
import { HeaderLayout } from "../../../layouts/header-layout";

import style from "../style.module.scss";
import { useHistory } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { Input } from "../../../../components/form";
import { Button, Form } from "reactstrap";
import useForm from "react-hook-form";
import { ShowKeyRingMsg } from "../../../../../background/keyring";
import { sendMessage } from "../../../../../common/message/send";
import { BACKGROUND_PORT } from "../../../../../common/message/constant";

interface FormData {
  password: string;
}

export const ExportPage: FunctionComponent = () => {
  const history = useHistory();
  const intl = useIntl();

  const [loading, setLoading] = useState(false);
  const [keyRing, setKeyRing] = useState("");

  const { register, handleSubmit, setError, errors } = useForm<FormData>({
    defaultValues: {
      password: ""
    }
  });

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle="Export"
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      {keyRing ? (
        <div>{keyRing}</div>
      ) : (
        <Form
          className={style.formContainer}
          onSubmit={handleSubmit(async data => {
            setLoading(true);
            try {
              const msg = new ShowKeyRingMsg(data.password);
              setKeyRing(await sendMessage(BACKGROUND_PORT, msg));
            } catch (e) {
              console.log("Fail to decrypt: " + e.message);
              setError(
                "password",
                "invalid",
                intl.formatMessage({
                  id: "lock.input.password.error.invalid"
                })
              );
            } finally {
              setLoading(false);
            }
          })}
        >
          <div>대충 경고하는 메세지</div>
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
      )}
    </HeaderLayout>
  );
};
