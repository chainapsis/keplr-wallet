import React, { FunctionComponent } from "react";
import { BackButton } from "../index";
import { FormattedMessage, useIntl } from "react-intl";
import { Input, TextArea } from "@components/form";
import style from "../style.module.scss";
import { Form } from "reactstrap";
import { useForm } from "react-hook-form";
import { Buffer } from "buffer";
import { parseEthPrivateKey } from "@fetchai/eth-migration";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { ButtonV2 } from "@components-v2/buttons/button";

interface FormData {
  name: string;
  ethAddress: string;
  ethPrivateKey: string;
  password: string;
  confirmPassword: string;
}

function isPrivateKey(str: string): boolean {
  if (str.startsWith("0x")) {
    return true;
  }

  return str.length === 64;
}

export const MigrateMetamaskPrivateKeyPage: FunctionComponent<{
  registerConfig: RegisterConfig;
  onBack: () => void;
}> = ({ registerConfig, onBack }) => {
  const intl = useIntl();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      ethAddress: "",
      ethPrivateKey: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <div className={style["migrateContainer"]}>
      <BackButton onClick={onBack} />
      <h1 style={{ color: "rgba(255,255,255)" }}>
        <FormattedMessage id="register.eth-migrate.metamask-private-key.title" />
      </h1>
      <Form
        className={style["formContainer"]}
        onSubmit={handleSubmit(async (data: FormData) => {
          // extract the private key
          const privateKey = Buffer.from(
            data.ethPrivateKey.trim().replace("0x", ""),
            "hex"
          );

          // attempt to parse the private key information
          const parsedKey = parseEthPrivateKey(privateKey);
          if (parsedKey === undefined) {
            alert("Unable to parse private key");
            return;
          }

          // check that the parsed private key matches
          if (parsedKey.ethAddress !== data.ethAddress) {
            alert("This private key does not match the address provided");
            return;
          }

          // trigger the on complete handler
          await registerConfig.createPrivateKey(
            data.name,
            privateKey,
            data.password
          );
        })}
      >
        <Input
          className={style["input"]}
          label={intl.formatMessage({
            id: "register.name",
          })}
          type="text"
          {...register("name", {
            required: intl.formatMessage({
              id: "register.name.error.required",
            }),
          })}
          error={errors.name && errors.name.message}
          maxLength={20}
        />
        <Input
          className={style["input"]}
          label={intl.formatMessage({
            id: "register.eth-migrate.eth-address",
          })}
          type="text"
          {...register("ethAddress", {
            required: intl.formatMessage({
              id: "register.eth-migrate.eth-address.error.required",
            }),
          })}
          error={errors.ethAddress && errors.ethAddress.message}
        />
        <TextArea
          label="Private Key"
          className={style["mnemonic"]}
          placeholder="Enter your private key"
          rows={3}
          {...register("ethPrivateKey", {
            required: "Private key is required",
            validate: (value: string): string | undefined => {
              if (!isPrivateKey(value)) {
                return intl.formatMessage({
                  id: "register.eth-migrate.eth-private-key.error.invalid",
                });
              } else {
                value = value.replace("0x", "");
                if (value.length !== 64) {
                  return intl.formatMessage({
                    id: "register.import.textarea.private-key.error.invalid-length",
                  });
                }

                const privateKeyData = Buffer.from(value, "hex");
                try {
                  if (
                    privateKeyData.toString("hex").toLowerCase() !==
                    value.toLowerCase()
                  ) {
                    return intl.formatMessage({
                      id: "register.import.textarea.private-key.error.invalid",
                    });
                  }
                } catch {
                  return intl.formatMessage({
                    id: "register.import.textarea.private-key.error.invalid",
                  });
                }

                // parse the private key
                const parsedKey = parseEthPrivateKey(privateKeyData);
                if (parsedKey === undefined) {
                  return "Invalid ETH private key";
                }

                // check that the parsed private key matches
                if (parsedKey.ethAddress !== getValues()["ethAddress"]) {
                  return "The key provided doesn't match the supplied ETH addres";
                }
              }
            },
          })}
          error={errors.ethPrivateKey && errors.ethPrivateKey.message}
        />
        {registerConfig.mode === "create" && (
          <React.Fragment>
            <Input
              className={style["input"]}
              label={intl.formatMessage({
                id: "register.create.input.password",
              })}
              type="password"
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
            <Input
              className={style["input"]}
              label={intl.formatMessage({
                id: "register.create.input.confirm-password",
              })}
              type="password"
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
        )}
        <ButtonV2
          styleProps={{ marginBottom: "20px" }}
          text={
            registerConfig.isLoading ? (
              <i className="fas fa-spinner fa-spin ml-2" />
            ) : (
              <FormattedMessage id="register.create.button.next" />
            )
          }
          disabled={registerConfig.isLoading}
        />
      </Form>
    </div>
  );
};
