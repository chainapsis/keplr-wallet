import React, { FunctionComponent, useEffect, useState } from "react";
import { HeaderLayout } from "../../../layouts";

import { useHistory } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import {
  Button,
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";

import { Input } from "../../../components/form";
import style from "./style.module.scss";
import useForm from "react-hook-form";
import { useNotification } from "../../../components/notification";
import { ChainUpdaterService } from "@keplr-wallet/background";
import { KeplrError } from "@keplr-wallet/router";
import { useConfirm } from "../../../components/confirm";
import { AlertExperimentalFeature } from "../../../components/alert-experimental-feature";
import { FormattedMessage, useIntl } from "react-intl";

interface FormData {
  rpc: string;
  lcd: string;
}

export const SettingEndpointsPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const intl = useIntl();
  const notification = useNotification();
  const confirm = useConfirm();

  const { chainStore } = useStore();
  const [selectedChainId, setSelectedChainId] = useState(
    chainStore.current.chainId
  );

  const [dropdownOpen, setOpen] = useState(false);
  const toggle = () => setOpen(!dropdownOpen);

  const { setValue, register, handleSubmit, errors, watch } = useForm<FormData>(
    {
      defaultValues: {
        rpc: "",
        lcd: "",
      },
    }
  );
  useEffect(() => {
    const chainInfo = chainStore.getChain(selectedChainId);
    setValue("rpc", chainInfo.rpc);
    setValue("lcd", chainInfo.rest);
  }, [chainStore, selectedChainId, setValue]);

  const [isLoading, setIsLoading] = useState(false);

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.endpoints",
      })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.container}>
        <div className={style.innerTopContainer}>
          <ButtonDropdown isOpen={dropdownOpen} toggle={toggle}>
            <DropdownToggle caret style={{ boxShadow: "none" }}>
              {chainStore.getChain(selectedChainId).chainName}
            </DropdownToggle>
            <DropdownMenu>
              {chainStore.chainInfos.map((chainInfo) => {
                return (
                  <DropdownItem
                    key={chainInfo.chainId}
                    onClick={(e) => {
                      e.preventDefault();

                      setSelectedChainId(chainInfo.chainId);
                    }}
                  >
                    {chainInfo.chainName}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </ButtonDropdown>
          <div style={{ flex: 1 }} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Button
              color="primary"
              size="sm"
              onClick={async (e) => {
                e.preventDefault();

                setIsLoading(true);

                try {
                  await chainStore.resetChainEndpoints(selectedChainId);

                  const chainInfo = chainStore.getChain(selectedChainId);
                  setValue("rpc", chainInfo.rpc);
                  setValue("lcd", chainInfo.rest);
                } catch (e) {
                  console.log(e);
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              <FormattedMessage id="setting.endpoints.button.reset" />
            </Button>
          </div>
        </div>
        <form
          className={style.formContainer}
          onSubmit={handleSubmit(async (data) => {
            setIsLoading(true);

            try {
              try {
                await ChainUpdaterService.checkEndpointsConnectivity(
                  selectedChainId,
                  data.rpc,
                  data.lcd
                );
              } catch (e) {
                if (
                  // Note the implementation of `ChainUpdaterService.checkEndpointsConnectivity`.
                  // In the case of this error, the chain version is different.
                  // It gives a warning and handles it if the user wants.
                  e instanceof KeplrError &&
                  e.module === "updater" &&
                  (e.code === 8002 || e.code === 8102)
                ) {
                  if (
                    !(await confirm.confirm({
                      paragraph: `The ${
                        e.code === 8002 ? "RPC" : "LCD"
                      } endpoint of the node might have different version with the registered chain. Do you want to proceed?`,
                    }))
                  ) {
                    return;
                  }
                } else {
                  notification.push({
                    type: "warning",
                    placement: "top-center",
                    duration: 5,
                    content: e.message,
                    canDelete: true,
                    transition: {
                      duration: 0.25,
                    },
                  });
                  return;
                }
              }

              chainStore.setChainEndpoints(selectedChainId, data.rpc, data.lcd);

              history.push("/");
            } catch (e) {
              notification.push({
                type: "warning",
                placement: "top-center",
                duration: 5,
                content: `Unknown error: ${e.message}`,
                canDelete: true,
                transition: {
                  duration: 0.25,
                },
              });
            } finally {
              setIsLoading(false);
            }
          })}
        >
          <Input
            label="RPC"
            name="rpc"
            error={errors.rpc && errors.rpc.message}
            ref={register({
              required: "RPC endpoint is required",
              validate: (value: string) => {
                try {
                  const url = new URL(value);
                  if (url.protocol !== "http:" && url.protocol !== "https:") {
                    return `Unsupported protocol: ${url.protocol}`;
                  }
                } catch {
                  return "Invalid url";
                }
              },
            })}
          />
          <Input
            label="LCD"
            name="lcd"
            error={errors.lcd && errors.lcd.message}
            ref={register({
              required: "LCD endpoint is required",
              validate: (value: string) => {
                try {
                  const url = new URL(value);
                  if (url.protocol !== "http:" && url.protocol !== "https:") {
                    return `Unsupported protocol: ${url.protocol}`;
                  }
                } catch {
                  return "Invalid url";
                }
              },
            })}
          />
          <div style={{ flex: 1 }} />
          <AlertExperimentalFeature />
          <Button
            type="submit"
            color="primary"
            block
            data-loading={isLoading}
            disabled={
              chainStore.getChain(selectedChainId).rpc === watch("rpc") &&
              chainStore.getChain(selectedChainId).rest === watch("lcd")
            }
          >
            <FormattedMessage id="setting.endpoints.button.confirm" />
          </Button>
        </form>
      </div>
    </HeaderLayout>
  );
});
