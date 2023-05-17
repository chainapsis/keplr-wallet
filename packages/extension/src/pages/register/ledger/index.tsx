import React, { FunctionComponent } from "react";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { FormattedMessage, useIntl } from "react-intl";
import { Button, Form } from "reactstrap";
import useForm from "react-hook-form";
import style from "../style.module.scss";
import { Input, PasswordInput } from "@components/form";
import { AdvancedBIP44Option, useBIP44Option } from "../advanced-bip44";
import { BackButton } from "../index";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { ledgerUSBVendorId } from "@ledgerhq/devices";

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
      size="lg"
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

  const { analyticsStore, ledgerInitStore } = useStore();

  const ensureUSBPermission = async () => {
    const anyNavigator = navigator as any;
    if (ledgerInitStore.isWebHID) {
      const device = await anyNavigator.hid.requestDevice({
        filters: [
          {
            vendorId: ledgerUSBVendorId,
          },
        ],
      });
      if (!device || (Array.isArray(device) && device.length === 0)) {
        throw new Error("No device selected");
      }
    } else {
      if (
        !(await anyNavigator.usb.requestDevice({
          filters: [
            {
              vendorId: ledgerUSBVendorId,
            },
          ],
        }))
      ) {
        throw new Error("No device selected");
      }
    }
  };

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
            await ensureUSBPermission();

            await registerConfig.createLedger(
              data.name,
              data.password,
              bip44Option.bip44HDPath,
              "Cosmos"
            );
            analyticsStore.setUserProperties({
              registerType: "ledger",
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
          maxLength={20}
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
        <AdvancedBIP44Option bip44Option={bip44Option} />
        <Button
          color="primary"
          type="submit"
          block
          size="lg"
          data-loading={registerConfig.isLoading}
        >
          <FormattedMessage id="register.create.button.next" />
        </Button>
        <Button
          type="button"
          color="link"
          onClick={handleSubmit(async (data: FormData) => {
            if (registerConfig.isLoading) {
              return;
            }

            try {
              await ensureUSBPermission();

              await registerConfig.createLedger(
                data.name,
                data.password,
                bip44Option.bip44HDPath,
                "Terra"
              );
              analyticsStore.setUserProperties({
                registerType: "ledger",
                accountType: "ledger",
              });
            } catch (e) {
              alert(e.message ? e.message : e.toString());
              registerConfig.clear();
            }
          })}
        >
          <FormattedMessage id="register.create.button.ledger.terra" />
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
