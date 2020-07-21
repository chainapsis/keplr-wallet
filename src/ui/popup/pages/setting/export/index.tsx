import React, { FunctionComponent, useCallback, useState } from "react";
import { HeaderLayout } from "../../../layouts/header-layout";

import { useHistory } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { Input } from "../../../../components/form";
import { Button, Form } from "reactstrap";
import useForm from "react-hook-form";
import { ShowKeyRingMsg } from "../../../../../background/keyring";
import { sendMessage } from "../../../../../common/message/send";
import { BACKGROUND_PORT } from "../../../../../common/message/constant";
import { WarningView } from "./warning-view";

import style from "./style.module.scss";

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
      alternativeTitle={intl.formatMessage({
        id: "setting.export"
      })}
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      <div className={style.container}>
        {keyRing ? (
          <div className={style.mnemonic}>{keyRing}</div>
        ) : (
          <React.Fragment>
            <WarningView />
            <Form
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
                      id: "setting.export.input.password.error.invalid"
                    })
                  );
                } finally {
                  setLoading(false);
                }
              })}
            >
              <Input
                type="password"
                label={intl.formatMessage({
                  id: "setting.export.input.password"
                })}
                name="password"
                error={errors.password && errors.password.message}
                ref={register({
                  required: intl.formatMessage({
                    id: "setting.export.input.password.error.required"
                  })
                })}
              />
              <Button
                type="submit"
                color="primary"
                block
                data-loading={loading}
              >
                <FormattedMessage id="setting.export.button.confirm" />
              </Button>
            </Form>
          </React.Fragment>
        )}
      </div>
    </HeaderLayout>
  );
};
