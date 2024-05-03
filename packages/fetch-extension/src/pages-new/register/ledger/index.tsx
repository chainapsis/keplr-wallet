import React, { FunctionComponent } from "react";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { FormattedMessage, useIntl } from "react-intl";
import { Button, Form, Label } from "reactstrap";
import { useForm } from "react-hook-form";
import style from "../style.module.scss";
import { Input, PasswordInput } from "@components-v2/form";
import { AdvancedBIP44Option, useBIP44Option } from "../advanced-bip44";
import { BackButton } from "../index";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { ledgerUSBVendorId } from "@ledgerhq/devices";
import { ButtonV2 } from "@components-v2/buttons/button";

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
    <ButtonV2
      onClick={(e: any) => {
        e.preventDefault();

        registerConfig.setType(TypeImportLedger);
        analyticsStore.logEvent("Import account started", {
          registerType: "ledger",
        });
      }}
      text={<FormattedMessage id="register.ledger.title" />}
    />
  );
});

export const ImportLedgerPage: FunctionComponent<{
  registerConfig: RegisterConfig;
  setSelectedCard: any;
}> = observer(({ registerConfig, setSelectedCard }) => {
  const intl = useIntl();

  const bip44Option = useBIP44Option(118);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
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
    <div className={style["ledgerContainer"]}>
      <BackButton
        onClick={() => {
          setSelectedCard("main");
        }}
      />
      <div className={style["pageTitle"]}>Connect hardware wallet</div>
      <div className={style["newMnemonicText"]}>
        To keep your account safe, avoid any personal information or words
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Form
          className={style["formContainer"]}
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
          <Label
            for="name"
            style={{
              color: "rgba(255,255,255,0.6)",
              fontWeight: 550,
              fontSize: "15px",
            }}
          >
            {intl.formatMessage({ id: "register.name" })}
          </Label>
          <Input
            className={style["addressInput"]}
            type="text"
            {...register("name", {
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
                {...register("password", {
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
                {...register("confirmPassword", {
                  required: intl.formatMessage({
                    id: "register.create.input.confirm-password.error.required",
                  }),
                  validate: (confirmPassword: string): string | undefined => {
                    if (confirmPassword !== getValues()["password"]) {
                      return intl.formatMessage({
                        id: "register.create.input.confirm-password.error.unmatched",
                      });
                    }
                  },
                })}
                error={errors.confirmPassword && errors.confirmPassword.message}
              />
            </React.Fragment>
          ) : null}
          <div style={{ width: "339px" }}>
            <AdvancedBIP44Option bip44Option={bip44Option} />
          </div>
          <ButtonV2
            data-loading={registerConfig.isLoading}
            text={
              registerConfig.isLoading ? (
                <i className="fas fa-spinner fa-spin ml-2" />
              ) : (
                <FormattedMessage id="register.create.button.next" />
              )
            }
            disabled={registerConfig.isLoading}
          />
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
      </div>
    </div>
  );
});
