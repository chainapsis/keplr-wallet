import React, { FunctionComponent } from "react";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { FormattedMessage, useIntl } from "react-intl";
import { Button, Form } from "reactstrap";
import useForm from "react-hook-form";
import style from "../style.module.scss";
import { Input, PasswordInput } from "../../../components/form";
import { useBIP44Option } from "../advanced-bip44";
import { BackButton } from "../index";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";

export const TypeImportKeystone = "import-keystone";

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const ImportKeystoneIntro: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const { analyticsStore } = useStore();
  return (
    <Button
      color="primary"
      outline
      block
      size="lg"
      onClick={(e) => {
        e.preventDefault();

        registerConfig.setType(TypeImportKeystone);
        analyticsStore.logEvent("Import account started", {
          registerType: "keystone",
        });
      }}
    >
      <FormattedMessage id="register.keystone.title" />
    </Button>
  );
});

export const ImportKeystonePage: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const intl = useIntl();

  const bip44Option = useBIP44Option();

  const { register, handleSubmit, getValues, errors } = useForm<FormData>({
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { analyticsStore } = useStore();

  return (
    <div>
      <div className={style.title}>
        {intl.formatMessage({
          id: "register.name",
        })}
      </div>
      <Form
        className={style.formContainer}
        onSubmit={handleSubmit(async (data: FormData) => {
          try {
            await registerConfig.createKeystone(
              data.name,
              data.password,
              bip44Option.bip44HDPath
            );
            analyticsStore.setUserProperties({
              registerType: "keystone",
              accountType: "keystone",
            });
          } catch (e: any) {
            alert(e.message ? e.message : e.toString());
            registerConfig.clear();
          }
        })}
      >
        <Input
          label={intl.formatMessage({
            id: "register.name",
          })}
          type="text"
          name="name"
          ref={register({
            required: intl.formatMessage({
              id: "register.name.error.required",
            }),
          })}
          error={errors.name && errors.name.message}
        />
        {registerConfig.mode === "create" ? (
          <React.Fragment>
            <PasswordInput
              label={intl.formatMessage({
                id: "register.create.input.password",
              })}
              name="password"
              ref={register({
                required: intl.formatMessage({
                  id: "register.create.input.password.error.required",
                }),
                validate: (password: string): string | undefined => {
                  if (password.length < 8) {
                    return intl.formatMessage({
                      id: "register.create.input.password.error.too-short",
                    });
                  }
                },
              })}
              error={errors.password && errors.password.message}
            />
            <PasswordInput
              label={intl.formatMessage({
                id: "register.create.input.confirm-password",
              })}
              name="confirmPassword"
              ref={register({
                required: intl.formatMessage({
                  id: "register.create.input.confirm-password.error.required",
                }),
                validate: (confirmPassword: string): string | undefined => {
                  if (confirmPassword !== getValues()["password"]) {
                    return intl.formatMessage({
                      id:
                        "register.create.input.confirm-password.error.unmatched",
                    });
                  }
                },
              })}
              error={errors.confirmPassword && errors.confirmPassword.message}
            />
          </React.Fragment>
        ) : null}
        {/* <AdvancedBIP44Option bip44Option={bip44Option} /> */}
        <Button
          color="primary"
          type="submit"
          block
          size="lg"
          data-loading={registerConfig.isLoading}
        >
          <FormattedMessage id="register.create.button.next" />
        </Button>
      </Form>
      <BackButton
        onClick={() => {
          registerConfig.clear();
        }}
      />
    </div>
  );
});
