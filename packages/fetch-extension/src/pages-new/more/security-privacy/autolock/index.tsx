import React, { FunctionComponent, useEffect, useState } from "react";

import { useNavigate } from "react-router";
import { Form } from "reactstrap";
import { DescriptionView } from "./description-view";

import { Input } from "@components-v2/form";
import style from "./style.module.scss";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";

import {
  GetAutoLockAccountDurationMsg,
  UpdateAutoLockAccountDurationMsg,
} from "@keplr-wallet/background/src/auto-lock-account";

import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { useStore } from "../../../../stores";
import { HeaderLayout } from "@layouts-v2/header-layout";
import { ButtonV2 } from "@components-v2/buttons/button";

interface FormData {
  duration: string;
}

export const AutoLockPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const { analyticsStore } = useStore();

  const minDuration = 0;
  const maxDuration = 4320;

  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
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
    navigate(-1);
  }

  const [isLoading, setIsLoading] = useState(false);

  return (
    <HeaderLayout
      showTopMenu={true}
      showChainName={false}
      canChangeChainInfo={false}
      smallTitle={true}
      showBottomMenu={false}
      onBackButton={() => {
        analyticsStore.logEvent("back_click", {
          pageName: "Autolock Timer",
        });

        navigate(-1);
      }}
    >
      <div className={style["container"]}>
        <DescriptionView />
        <Form
          onSubmit={handleSubmit(async (data) => {
            setIsLoading(true);
            updateAutoLockDuration(data.duration);
          })}
        >
          <Input
            className={style["inputField"]}
            style={{ marginBottom: "75px" }}
            label={"Lock after (unit:minutes)"}
            min="0"
            {...register("duration", {
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
          <ButtonV2
            styleProps={{
              height: "56px",
            }}
            data-loading={isLoading}
            text={""}
          >
            <FormattedMessage id="setting.endpoints.button.confirm" />
          </ButtonV2>
        </Form>
      </div>
    </HeaderLayout>
  );
};
