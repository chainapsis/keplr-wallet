import React, {
  FunctionComponent,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from "react";
import { HeaderLayout } from "../../../layouts";

import { useNavigate, useParams } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { PasswordInput } from "../../../components/form";
import { Button, Form } from "reactstrap";
import useForm from "react-hook-form";
import { useStore } from "../../../stores";
import { observer } from "mobx-react-lite";

import style from "./style.module.scss";
import { WarningView } from "./warning-view";

interface FormData {
  password: string;
}

export const ClearPage: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const params = useParams() as { index: string };

  const intl = useIntl();

  const [loading, setLoading] = useState(false);

  const { keyRingStore, analyticsStore } = useStore();
  const { register, handleSubmit, setError, errors } = useForm<FormData>({
    defaultValues: {
      password: "",
    },
  });

  useEffect(() => {
    if (parseInt(params.index).toString() !== params.index) {
      throw new Error("Invalid index");
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
        id: "setting.clear",
      })}
      onBackButton={useCallback(() => {
        navigate(-1);
      }, [history])}
    >
      <div className={style.container}>
        {keyStore ? (
          <WarningView index={parseInt(params.index)} keyStore={keyStore} />
        ) : null}
        <Form
          onSubmit={handleSubmit(async (data) => {
            setLoading(true);
            try {
              // Make sure that password is valid and keyring is cleared.
              await keyRingStore.deleteKeyRing(
                parseInt(params.index),
                data.password
              );
              analyticsStore.logEvent("Account removed");

              navigate("/");
            } catch (e) {
              console.log("Fail to decrypt: " + e.message);
              setError(
                "password",
                "invalid",
                intl.formatMessage({
                  id: "setting.clear.input.password.error.invalid",
                })
              );
              setLoading(false);
            }
          })}
        >
          <PasswordInput
            label={intl.formatMessage({
              id: "setting.clear.input.password",
            })}
            name="password"
            error={errors.password && errors.password.message}
            ref={register({
              required: intl.formatMessage({
                id: "setting.clear.input.password.error.required",
              }),
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
