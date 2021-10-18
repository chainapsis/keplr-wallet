import React, { FunctionComponent } from "react";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { FormattedMessage, useIntl } from "react-intl";
import { Button, Form } from "reactstrap";
import useForm from "react-hook-form";
import style from "../style.module.scss";
import { Input } from "../../../components/form";
import { AdvancedBIP44Option, useBIP44Option } from "../advanced-bip44";
import { BackButton } from "../index";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";

export const TypeImportLedger = "import-ledger";

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const ImportLedgerIntro: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const { analyticsStore } = useStore();

  return (
    <Button
      color="primary"
      outline
      block
      onClick={(e) => {
        e.preventDefault();

        registerConfig.setType(TypeImportLedger);
        analyticsStore.logEvent("Import account started", {
          registerType: "ledger",
        });
      }}
    >
      <FormattedMessage id="register.ledger.title" />
    </Button>
  );
});

export const ImportLedgerPage: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const intl = useIntl();

  const bip44Option = useBIP44Option(118);

  const { register, handleSubmit, getValues, errors } = useForm<FormData>({
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { analyticsStore, accountStore } = useStore();

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
            await registerConfig.createLedger(
              data.name,
              data.password,
              bip44Option.bip44HDPath
            );
            const accountInfo = accountStore.getAccount(
              analyticsStore.mainChainId
            );
            analyticsStore.setUserId(accountInfo.bech32Address);
            analyticsStore.setUserProperties({
              registerType: "ledger",
              accountType: "ledger",
            });
            analyticsStore.logEvent("Import account finished", {
              accountType: "ledger",
            });
          } catch (e) {
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
            <Input
              label={intl.formatMessage({
                id: "register.create.input.password",
              })}
              type="password"
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
            <Input
              label={intl.formatMessage({
                id: "register.create.input.confirm-password",
              })}
              type="password"
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
        <AdvancedBIP44Option bip44Option={bip44Option} />
        <Button
          color="primary"
          type="submit"
          block
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
