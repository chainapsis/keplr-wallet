import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { HeaderLayout } from "../../../layouts";

import { useHistory } from "react-router";
import { observer } from "mobx-react-lite";
import { Button, Form } from "reactstrap";
import { DescriptionView } from "./description-view";

import { Input } from "../../../components/form";
import style from "./style.module.scss";
import useForm from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";

import {
  GetAutoLockAccountIntervalMsg,
  UpdateAutoLockAccountIntervalMsg,
} from "@keplr-wallet/background/src/auto-lock-account";

import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

interface FormData {
  interval: string;
}

export const SettingAutoLockPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const intl = useIntl();

  const requester = new InExtensionMessageRequester();

  const minInterval = 0;
  const maxInterval = 10000;

  const { setValue, register, handleSubmit, errors } = useForm<FormData>({
    defaultValues: {
      interval: "0",
    },
  });

  const getAutoLockInterval = useCallback(async () => {
    const msg = new GetAutoLockAccountIntervalMsg();
    requester.sendMessage(BACKGROUND_PORT, msg).then(function (interval) {
      setValue("interval", interval / 60000 + "");
    });
  }, []);

  useEffect(() => {
    getAutoLockInterval();
  }, [getAutoLockInterval]);

  function updateAutoLockInterval(input: string) {
    let interval = parseInt(input);
    if (interval >= 0) {
      interval = interval * 60000;
      const msg = new UpdateAutoLockAccountIntervalMsg(interval);
      requester.sendMessage(BACKGROUND_PORT, msg);
    }
    history.goBack();
  }

  const [isLoading, setIsLoading] = useState(false);

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.autolock",
      })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.container}>
        <React.Fragment>
          <DescriptionView />
          <Form
            onSubmit={handleSubmit(async (data) => {
              setIsLoading(true);
              updateAutoLockInterval(data.interval);
            })}
          >
            <Input
              label={intl.formatMessage({
                id: "setting.autolock.interval",
              })}
              name="interval"
              ref={register({
                required: intl.formatMessage({
                  id: "setting.autolock.error.required",
                }),
                validate: (input: string): string | undefined => {
                  const interval = parseInt(input);
                  if (interval < minInterval || interval > maxInterval) {
                    return intl.formatMessage({
                      id: "setting.autolock.error.out-of-range",
                    });
                  }
                },
              })}
              type="text"
              pattern="[0-9]*"
              error={errors.interval && errors.interval.message}
            />
            <Button
              type="submit"
              color="primary"
              block
              data-loading={isLoading}
            >
              <FormattedMessage id="setting.endpoints.button.confirm" />
            </Button>
          </Form>
        </React.Fragment>
      </div>
    </HeaderLayout>
  );
});
