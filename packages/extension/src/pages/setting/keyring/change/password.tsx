import React, { FunctionComponent, useCallback, useState } from "react";
import { HeaderLayout } from "../../../../layouts";

import { useHistory } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { Input } from "../../../../components/form";
import { Button, Form } from "reactstrap";
import useForm from "react-hook-form";

import stylePassword from "./password.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { WarningView } from "./warning-view";

interface CheckPasswordFormData {
  previousPassword: string;
}

interface ChangePasswordFormData {
  password: string;
  confirmPassword: string;
}

export const ChangePasswordPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const intl = useIntl();

  const { keyRingStore } = useStore();

  const [loading, setLoading] = useState(false);
  const [previousPassword, setPreviousPassword] = useState("");

  const {
    register: checkRegister,
    handleSubmit: checkHandleSubmit,
    setError: checkSetError,
    errors: checkErrors,
  } = useForm<CheckPasswordFormData>({
    defaultValues: {
      previousPassword: "",
    },
  });

  const {
    register: changeRegister,
    handleSubmit: changeHandleSubmit,
    setError: changeSetError,
    getValues: changeGetValues,
    errors: changeErrors,
  } = useForm<ChangePasswordFormData>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.keyring.change.password",
      })}
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      <div className={stylePassword.container}>
        {previousPassword ? (
          <React.Fragment>
            <Form
              onSubmit={changeHandleSubmit(
                async (data: ChangePasswordFormData) => {
                  setLoading(true);
                  try {
                    await keyRingStore.updatePassword(
                      previousPassword,
                      data.password
                    );
                    history.push("/");
                  } catch (e) {
                    console.log("Fail to decrypt: " + e.message);
                    changeSetError(
                      "password",
                      "invalid",
                      intl.formatMessage({
                        id:
                          "setting.keyring.change.input.password.error.invalid",
                      })
                    );
                    setLoading(false);
                  }
                }
              )}
            >
              <Input
                label={intl.formatMessage({
                  id: "setting.keyring.change.input.password",
                })}
                type="password"
                name="password"
                ref={changeRegister({
                  required: intl.formatMessage({
                    id: "setting.keyring.change.input.password.error.required",
                  }),
                  validate: (password: string): string | undefined => {
                    if (password.length < 8) {
                      return intl.formatMessage({
                        id:
                          "setting.keyring.change.input.password.error.too-short",
                      });
                    }
                  },
                })}
                error={changeErrors.password && changeErrors.password.message}
              />
              <Input
                label={intl.formatMessage({
                  id: "setting.keyring.change.input.confirm-password",
                })}
                type="password"
                name="confirmPassword"
                ref={changeRegister({
                  required: intl.formatMessage({
                    id:
                      "setting.keyring.change.input.confirm-password.error.required",
                  }),
                  validate: (confirmPassword: string): string | undefined => {
                    if (confirmPassword !== changeGetValues()["password"]) {
                      return intl.formatMessage({
                        id:
                          "setting.keyring.change.input.confirm-password.error.unmatched",
                      });
                    }
                  },
                })}
                error={
                  changeErrors.confirmPassword &&
                  changeErrors.confirmPassword.message
                }
              />
              <Button
                color="primary"
                type="submit"
                block
                data-loading={loading}
              >
                <FormattedMessage id="setting.keyring.change.password.button.save" />
              </Button>
            </Form>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <WarningView />
            <Form
              onSubmit={checkHandleSubmit(
                async (data: CheckPasswordFormData) => {
                  setLoading(true);
                  try {
                    await keyRingStore.checkPassword(data.previousPassword);
                    setPreviousPassword(data.previousPassword);
                  } catch (e) {
                    console.log("Fail to decrypt: " + e.message);
                    checkSetError(
                      "previousPassword",
                      "invalid",
                      intl.formatMessage({
                        id:
                          "setting.keyring.change.input.previous-password.error.invalid",
                      })
                    );
                  } finally {
                    setLoading(false);
                  }
                }
              )}
            >
              <Input
                type="password"
                label={intl.formatMessage({
                  id: "setting.keyring.change.input.previous-password",
                })}
                name="previousPassword"
                error={
                  checkErrors.previousPassword &&
                  checkErrors.previousPassword.message
                }
                ref={checkRegister({
                  required: intl.formatMessage({
                    id:
                      "setting.keyring.change.input.previous-password.error.required",
                  }),
                })}
              />
              <Button
                type="submit"
                color="primary"
                block
                data-loading={loading}
              >
                <FormattedMessage id="setting.keyring.change.previous-password.button.confirm" />
              </Button>
            </Form>
          </React.Fragment>
        )}
      </div>
    </HeaderLayout>
  );
});
