import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from "react";
import { HeaderLayout } from "../../../layouts/header-layout";

import { useHistory, useLocation, useRouteMatch } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { Input } from "../../../../components/form";
import { Button, Form } from "reactstrap";
import useForm from "react-hook-form";
import { ShowKeyRingMsg } from "../../../../../background/keyring";
import { sendMessage } from "../../../../../common/message/send";
import { BACKGROUND_PORT } from "../../../../../common/message/constant";
import { WarningView } from "./warning-view";

import classnames from "classnames";
import queryString from "query-string";

import style from "./style.module.scss";

interface FormData {
  password: string;
}

export const ExportPage: FunctionComponent = () => {
  const history = useHistory();
  const location = useLocation();
  const match = useRouteMatch<{ index: string; type?: string }>();
  const intl = useIntl();

  const query = queryString.parse(location.search);

  const type = query.type ?? "mnemonic";

  const [loading, setLoading] = useState(false);
  const [keyRing, setKeyRing] = useState("");

  const { register, handleSubmit, setError, errors } = useForm<FormData>({
    defaultValues: {
      password: ""
    }
  });

  useEffect(() => {
    if (parseInt(match.params.index).toString() !== match.params.index) {
      throw new Error("Invalid index");
    }
  }, [match.params.index]);

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id:
          type === "mnemonic" ? "setting.export" : "setting.export.private-key"
      })}
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      <div className={style.container}>
        {keyRing ? (
          <div
            className={classnames(style.mnemonic, {
              [style.altHex]: type !== "mnemonic"
            })}
          >
            {keyRing}
          </div>
        ) : (
          <React.Fragment>
            <WarningView />
            <Form
              onSubmit={handleSubmit(async data => {
                setLoading(true);
                try {
                  const msg = new ShowKeyRingMsg(
                    parseInt(match.params.index),
                    data.password
                  );
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
