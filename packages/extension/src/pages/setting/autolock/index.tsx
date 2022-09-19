import React, { FunctionComponent, useEffect, useState } from "react";
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
  GetAutoLockAccountDurationMsg,
  UpdateAutoLockAccountDurationMsg,
} from "@keplr-wallet/background/src/auto-lock-account";

import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

interface FormData {
  duration: string;
}

export const SettingAutoLockPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const intl = useIntl();

  const minDuration = 0;
  const maxDuration = 4320;

  const { setValue, register, handleSubmit, errors } = useForm<FormData>({
    defaultValues: {
      duration: "0",
    },
  });

  useEffect(() => {
    const msg = new GetAutoLockAccountDurationMsg();
    new InExtensionMessageRequester()
      .sendMessage(BACKGROUND_PORT, msg)
      .then(function (duration) {
        setValue("duration", (duration / 60000).toString());
      });
  }, [setValue]);

  function updateAutoLockDuration(input: string) {
    let duration = parseInt(input);
    if (duration >= 0) {
      duration = duration * 60000;
      const msg = new UpdateAutoLockAccountDurationMsg(duration);
      new InExtensionMessageRequester().sendMessage(BACKGROUND_PORT, msg);
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
        <DescriptionView />
        <Form
          onSubmit={handleSubmit(async (data) => {
            setIsLoading(true);
            updateAutoLockDuration(data.duration);
          })}
        >
          <Input
            label={intl.formatMessage({
              id: "setting.autolock.duration",
            })}
            name="duration"
            ref={register({
              required: intl.formatMessage({
                id: "setting.autolock.error.required",
              }),
              validate: (input: string): string | undefined => {
                const duration = parseInt(input);

                if (Number.isNaN(duration)) {
                  return "NaN";
                }

                if (duration < minDuration || duration > maxDuration) {
                  return intl.formatMessage({
                    id: "setting.autolock.error.out-of-range",
                  });
                }
              },
            })}
            type="number"
            pattern="[0-9]*"
            error={errors.duration && errors.duration.message}
          />
          <Button type="submit" color="primary" block data-loading={isLoading}>
            <FormattedMessage id="setting.endpoints.button.confirm" />
          </Button>
        </Form>
      </div>
    </HeaderLayout>
  );
});
