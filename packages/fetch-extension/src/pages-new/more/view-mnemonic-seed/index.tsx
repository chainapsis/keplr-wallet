import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { useNavigate, useLocation, useParams } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { Form } from "reactstrap";
import { useForm } from "react-hook-form";
import { WarningView } from "./warning-view";
import classnames from "classnames";
import queryString from "query-string";
import style from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { flowResult } from "mobx";
import { HeaderLayout } from "@layouts-v2/header-layout";
import { ButtonV2 } from "@components-v2/buttons/button";
import { PasswordInput } from "@components-v2/form";
import { useNotification } from "@components/notification";

interface FormData {
  password: string;
}

export const ExportPage: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { index = "-1 " } = useParams<{ index: string; type?: string }>();

  const intl = useIntl();
  const notification = useNotification();
  const { keyRingStore, analyticsStore } = useStore();

  const query = queryString.parse(location.search);

  const type = query["type"] ?? "mnemonic";

  const [loading, setLoading] = useState(false);
  const [keyRing, setKeyRing] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      password: "",
    },
  });

  useEffect(() => {
    if (parseInt(index).toString() !== index) {
      throw new Error("Invalid index");
    }
  }, [index]);

  const copyMnemonic = useCallback(
    async (address: string) => {
      await navigator.clipboard.writeText(address);
      notification.push({
        placement: "top-center",
        type: "success",
        duration: 5,
        content: "Mnemonic copied to clipboard!",
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    },
    [notification]
  );

  return (
    <HeaderLayout
      smallTitle={true}
      showTopMenu={true}
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id:
          type === "mnemonic" ? "setting.export" : "setting.export.private-key",
      })}
      onBackButton={useCallback(() => {
        analyticsStore.logEvent("back_click", {
          pageName:
            type === "mnemonic" ? "View Mnemonic Seed" : "View Private Key",
        });
        navigate(-1);
      }, [navigate])}
    >
      <div className={style["container"]}>
        {keyRing ? (
          <div
            className={classnames(style["mnemonic"], {
              [style["altHex"]]: type !== "mnemonic",
            })}
          >
            {keyRing}
            <ButtonV2
              styleProps={{
                position: "absolute",
                width: "333px",
                bottom: 86,
                right: "4%",
              }}
              text={"Copy to clipboard"}
              onClick={() => copyMnemonic(keyRing)}
            />
          </div>
        ) : (
          <React.Fragment>
            <WarningView />
            <Form
              onSubmit={handleSubmit(async (data) => {
                setLoading(true);
                try {
                  setKeyRing(
                    await flowResult(
                      keyRingStore.showKeyRing(parseInt(index), data.password)
                    )
                  );
                } catch (e) {
                  console.log("Fail to decrypt: " + e.message);
                  setError("password", {
                    message: intl.formatMessage({
                      id: "setting.export.input.password.error.invalid",
                    }),
                  });
                } finally {
                  setLoading(false);
                }
              })}
            >
              <PasswordInput
                error={errors.password && errors.password.message}
                {...register("password", {
                  required: intl.formatMessage({
                    id: "setting.export.input.password.error.required",
                  }),
                })}
              />
              <ButtonV2
                text={
                  loading ? (
                    <i className="fas fa-spinner fa-spin ml-2" />
                  ) : (
                    <FormattedMessage id="setting.export.button.confirm" />
                  )
                }
                data-loading={loading}
                disabled={loading}
              />
            </Form>
          </React.Fragment>
        )}
      </div>
    </HeaderLayout>
  );
});
