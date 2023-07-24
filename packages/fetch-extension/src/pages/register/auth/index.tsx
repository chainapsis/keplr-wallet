import React, { FunctionComponent, useEffect, useState } from "react";
import { Web3AuthNoModal as Web3Auth } from "@web3auth/no-modal";
import { CommonPrivateKeyProvider } from "@web3auth/base-provider";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import {
  OPENLOGIN_NETWORK,
  OpenloginAdapter,
} from "@web3auth/openlogin-adapter";
import style from "./style.module.scss";
import { Image } from "./image";
import classNames from "classnames";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import CosmosRpc from "./cosmos-rpc";
import { Button, Form } from "reactstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { BackButton } from "..";
import { useForm } from "react-hook-form";
import { Input, PasswordInput } from "@components/form";
// eslint-disable-next-line import/no-extraneous-dependencies
import { AuthApiKey } from "../../../config.ui";
// get from https://dashboard.web3auth.io

export const AuthIntro: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
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
          displayName: "FetchHub",
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

  const imageId = `login-google-light`;
  const hoverImage = `login-google-active`;
  const [image, setImage] = useState(`login-google-light`);
  return (
    <React.Fragment>
      {AuthApiKey && (
        <div
          className={style["container"]}
          onMouseEnter={() => setImage("login-google-active")}
          onMouseLeave={() => setImage("login-google-light")}
          onClick={async (e) => {
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
            } catch (e) {}
          }}
        >
          <button
            type="button"
            className={classNames(
              style["w3abutton"],
              style["wfull"],
              style["w3abuttonlogin"]
            )}
          >
            <Image
              width="20"
              imageId={imageId}
              hoverImageId={hoverImage}
              isButton
              image={`https://images.web3auth.io/${image}.svg`}
            />
            <span className={style["gTitle"]}>
              <FormattedMessage id="sign.in.google" />
            </span>
            <a href="https://web3auth.io/" className={style["authPoweredBy"]}>
              <FormattedMessage id="sign.in.auth-powered" />
            </a>
          </button>
        </div>
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
        <Input
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
        {registerConfig.mode === "create" ? (
          <React.Fragment>
            <PasswordInput
              label={intl.formatMessage({
                id: "register.create.input.password",
              })}
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
              label={intl.formatMessage({
                id: "register.create.input.confirm-password",
              })}
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
    </React.Fragment>
  );
});

// eslint-disable-next-line import/no-default-export
