import React, { FunctionComponent, useEffect, useState } from "react";
import { Web3AuthNoModal as Web3Auth } from "@web3auth/no-modal";
import { CommonPrivateKeyProvider } from "@web3auth/base-provider";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import {
  OPENLOGIN_NETWORK,
  OpenloginAdapter,
} from "@web3auth/openlogin-adapter";
import style from "./style.module.scss";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import CosmosRpc from "./cosmos-rpc";
import { Form, Label } from "reactstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { BackButton } from "..";
import { useForm } from "react-hook-form";
import { Input, PasswordInput } from "@components-v2/form";
// eslint-disable-next-line import/no-extraneous-dependencies
import { AuthApiKey } from "../../../config.ui";
import { useStore } from "../../../stores";
import { ButtonV2 } from "@components-v2/buttons/button";
import { Card } from "@components-v2/card";
// get from https://dashboard.web3auth.io

export const AuthIntro: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const { analyticsStore } = useStore();

  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const isEnvDevelopment = process.env.NODE_ENV !== "production";
  useEffect(() => {
    if (!AuthApiKey) return;
    const init = async () => {
      try {
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.OTHER,
          chainId: "fetchhub-4",
          rpcTarget: "https://rpc-fetchhub.fetch-ai.com",
          displayName: "fetch",
          blockExplorer: "https://explore.fetch.ai/",
          ticker: "FET",
          tickerName: "Fetch Token",
        };
        const web3auth = new Web3Auth({
          clientId: AuthApiKey,
          chainConfig,
          web3AuthNetwork: isEnvDevelopment
            ? OPENLOGIN_NETWORK.TESTNET
            : OPENLOGIN_NETWORK.CYAN,
        });
        setWeb3auth(web3auth);
        const privateKeyProvider = new CommonPrivateKeyProvider({
          config: { chainConfig },
        });
        const openloginAdapter = new OpenloginAdapter({ privateKeyProvider });
        web3auth.configureAdapter(openloginAdapter);

        await web3auth.init();
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const login = async () => {
    if (!web3auth) {
      return;
    }
    return await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
      loginProvider: "google",
    });
  };

  const logout = async () => {
    if (!web3auth) {
      return;
    }
    await web3auth.logout();
  };
  const getPrivateKey = async (provider: any) => {
    if (!provider) {
      return "";
    }
    const rpc = new CosmosRpc(provider);
    return await rpc.getPrivateKey();
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      return;
    }
    const user = await web3auth.getUserInfo();
    return user.email;
  };

  return (
    <React.Fragment>
      {AuthApiKey && (
        <Card
          leftImageStyle={{ height: "32px", width: "32px" }}
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            height: "78px",
            fontSize: "14px",
            marginBottom: "10px",
          }}
          onClick={async (e: any) => {
            e.preventDefault();
            const target = e.target as HTMLElement;
            if (target.tagName === "A") {
              const url = target.getAttribute("href");
              if (url) {
                window.open(url, "_blank"); // Open the URL in a new window
              }
              return;
            }
            try {
              const data = await login();
              const privateKey = await getPrivateKey(data);
              if (!privateKey) return;
              registerConfig.setType("auth");
              registerConfig.setPrivateKey(privateKey);
              const email = await getUserInfo();
              registerConfig.setEmail(email || "");
              await logout();
            } catch (e) {
            } finally {
              analyticsStore.logEvent("Create/Import account started", {
                registerType: "google",
              });
            }
          }}
          leftImage={require("@assets/svg/wireframe/google-icon.svg")}
          subheading={"Powered by Web3Auth"}
          heading={"Continue with Google"}
        />
      )}
    </React.Fragment>
  );
});

interface FormData {
  name: string;
  words: string;
  password: string;
  confirmPassword: string;
}
export const AuthPage: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const intl = useIntl();
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
    },
  });
  const privateKey = Buffer.from(
    registerConfig.privateKey.trim().replace("0x", ""),
    "hex"
  );
  return (
    <React.Fragment>
      <BackButton
        onClick={() => {
          registerConfig.clear();
        }}
      />
      <Form
        className={style["formContainer"]}
        onSubmit={handleSubmit(async (data: FormData) => {
          registerConfig.createPrivateKey(
            data.name,
            privateKey,
            data.password,
            { email: registerConfig.email }
          );
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
          style={{ width: "333px !important" }}
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
        <ButtonV2
          text={
            registerConfig.isLoading ? (
              <i className="fas fa-spinner fa-spin ml-2" />
            ) : (
              <FormattedMessage id="register.create.button.next" />
            )
          }
          disabled={registerConfig.isLoading}
          data-loading={registerConfig.isLoading}
        />
      </Form>
    </React.Fragment>
  );
});

// eslint-disable-next-line import/no-default-export
