import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { RecipientInput, TextInput } from "../../../../components/input";
import { RecipientInput as RecipientInputForStarknet } from "../../../starknet/components/input/reciepient-input";

import { useSearchParams } from "react-router-dom";
import {
  useMemoConfig,
  useRecipientConfig,
  useTxConfigsValidate,
} from "@keplr-wallet/hooks";
import {
  useRecipientConfig as useRecipientConfigForStarknet,
  useTxConfigsValidate as useTxConfigsValidateForStarknet,
} from "@keplr-wallet/hooks-starknet";
import { useStore } from "../../../../stores";
import { MemoInput } from "../../../../components/input/memo-input";
import { useNavigate } from "react-router";
import { useIntl } from "react-intl";
import { ENSInfo } from "../../../../config.ui";

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
};

export const SettingContactsAdd: FunctionComponent = observer(() => {
  const { chainStore, uiConfigStore } = useStore();
  const labelRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const intl = useIntl();

  const [chainId, setChainId] = useState(chainStore.chainInfosInUI[0].chainId);
  // If edit mode, this will be equal or greater than 0.
  const [editIndex, setEditIndex] = useState(-1);

  const [name, setName] = useState("");

  const recipientConfigForStarknet = useRecipientConfigForStarknet(
    chainStore,
    chainId
  );

  const memoConfig = useMemoConfig(chainStore, chainId);

  const [searchParams] = useSearchParams();
  // Param "chainId" is required.
  const paramChainId = searchParams.get("chainId");
  const paramEditIndex = searchParams.get("editIndex");

  // First it comes with chainId=all, and then when the starknet address comes in, it does a url replace.
  // get the previous address to make the UI feel like the url hasn't changed
  const paramPrevisouAddress = searchParams.get("address");
  const isSelectedAllChain =
    searchParams.get("isFromAllChain") === "true" || paramChainId === "all";

  const recipientConfig = useRecipientConfig(chainStore, chainId, {
    allowHexAddressToBech32Address:
      chainStore.hasChain(chainId) &&
      !chainStore.getChain(chainId).chainId.startsWith("injective"),
    icns: uiConfigStore.icnsInfo,
    ens: ENSInfo,
    enableNameserviceWhenPrefixEntered: isSelectedAllChain,
  });
  const isStarknet =
    chainStore.hasModularChain(chainId) &&
    "starknet" in chainStore.getModularChain(chainId);

  const chainIdByPrefixMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const chainInfo of chainStore.chainInfosInUI) {
      if (chainInfo.bech32Config?.bech32PrefixAccAddr) {
        map.set(chainInfo.bech32Config?.bech32PrefixAccAddr, chainInfo.chainId);
      }
    }
    map.set("eth", "eip155:1");
    map.set("stark", "starknet:SN_MAIN");
    return map;
  }, [chainStore.chainInfosInUI]);

  useEffect(() => {
    if (labelRef.current) {
      labelRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (paramPrevisouAddress) {
      if (isStarknet) {
        recipientConfigForStarknet.setValue(paramPrevisouAddress);
      } else {
        recipientConfig.setValue(paramPrevisouAddress);
      }
    }
  }, [
    isStarknet,
    paramPrevisouAddress,
    recipientConfig,
    recipientConfigForStarknet,
  ]);

  useEffect(() => {
    if (!paramChainId) {
      throw new Error(`Param "chainId" is required`);
    }

    const localChainId =
      paramChainId === "all"
        ? chainStore.chainInfosInUI[0].chainId
        : paramChainId;
    setChainId(localChainId);

    if (isStarknet) {
      recipientConfigForStarknet.setChain(localChainId);
    } else {
      recipientConfig.setChain(localChainId);
    }

    memoConfig.setChain(localChainId);

    if (paramEditIndex) {
      const index = Number.parseInt(paramEditIndex);
      const addressBook =
        uiConfigStore.addressBookConfig.getAddressBook(localChainId);
      if (addressBook.length > index) {
        setEditIndex(index);
        const data = addressBook[index];
        setName(data.name);
        if (isStarknet) {
          recipientConfigForStarknet.setValue(data.address);
        } else {
          recipientConfig.setValue(data.address);
        }
        memoConfig.setValue(data.memo);
        return;
      }
    }

    setEditIndex(-1);
  }, [
    chainStore.chainInfosInUI,
    intl,
    isStarknet,
    memoConfig,
    paramChainId,
    paramEditIndex,
    recipientConfig,
    recipientConfigForStarknet,
    uiConfigStore.addressBookConfig,
  ]);

  const txConfigsValidate = useTxConfigsValidate({
    recipientConfig,
    memoConfig,
    isIgnoringStarknet: isStarknet,
  });

  const txConfigsValidateForStarknet = useTxConfigsValidateForStarknet({
    recipientConfig: recipientConfigForStarknet,
  });

  return (
    <HeaderLayout
      title={
        editIndex < 0
          ? intl.formatMessage({ id: "page.setting.contacts.add.add-title" })
          : intl.formatMessage({ id: "page.setting.contacts.add.edit-title" })
      }
      left={<BackButton />}
      onSubmit={(e) => {
        e.preventDefault();

        const address = (() => {
          if ("nameServiceResult" in recipientConfig) {
            // name service fetch가 성공했을 경우 저장할때는 suffix까지 포함된 형태로 저장한다.
            const r = recipientConfig.nameServiceResult;
            if (r.length > 0) {
              return r[0].fullName;
            }
          }

          return isStarknet
            ? recipientConfigForStarknet.value
            : recipientConfig.value;
        })();

        if (editIndex < 0) {
          uiConfigStore.addressBookConfig.addAddressBook(chainId, {
            name,
            address,
            memo: memoConfig.value,
          });
        } else {
          uiConfigStore.addressBookConfig.setAddressBookAt(chainId, editIndex, {
            name,
            address,
            memo: memoConfig.value,
          });
        }

        navigate(-1);
      }}
      bottomButtons={[
        {
          text: intl.formatMessage({
            id: "button.confirm",
          }),
          color: "secondary",
          size: "large",
          type: "submit",
          disabled:
            (isStarknet
              ? txConfigsValidateForStarknet.interactionBlocked
              : txConfigsValidate.interactionBlocked) || name === "",
        },
      ]}
    >
      <Styles.Container gutter="1rem">
        <TextInput
          label={intl.formatMessage({
            id: "page.setting.contacts.add.label-label",
          })}
          ref={labelRef}
          value={name}
          placeholder={intl.formatMessage({
            id: "page.setting.contacts.add.label-placeholder",
          })}
          onChange={(e) => {
            e.preventDefault();

            setName(e.target.value);
          }}
        />
        {isStarknet ? (
          <RecipientInputForStarknet
            recipientConfig={recipientConfigForStarknet}
            hideAddressBookButton={true}
            onChangeCallback={
              isSelectedAllChain
                ? (str) => {
                    const { chainPrefix } = parseAddressForAll(str);
                    const chainId = chainIdByPrefixMap.get(chainPrefix);

                    if (chainPrefix !== "stark" && chainId) {
                      navigate(
                        `/setting/contacts/add?chainId=${chainId}&isFromAllChain=${true}&address=${str}`,
                        { replace: true }
                      );
                    }
                  }
                : undefined
            }
          />
        ) : (
          <RecipientInput
            recipientConfig={recipientConfig}
            hideAddressBookButton={true}
            onChangeCallback={
              isSelectedAllChain
                ? (str) => {
                    if (!str || str.length === 0 || typeof str !== "string") {
                      return;
                    }

                    const { chainPrefix } = parseAddressForAll(str);
                    const chainId = chainIdByPrefixMap.get(chainPrefix);

                    if (!chainId) {
                      return;
                    }

                    if (chainPrefix === "stark") {
                      navigate(
                        `/setting/contacts/add?chainId=${chainId}&isFromAllChain=${true}&address=${str}`,
                        { replace: true }
                      );
                      return;
                    }

                    recipientConfig.setChain(chainId);
                    setChainId(chainId);
                  }
                : undefined
            }
          />
        )}
        <MemoInput
          label={intl.formatMessage({
            id: "page.setting.contacts.add.memo-label",
          })}
          placeholder={intl.formatMessage({
            id: "page.setting.contacts.add.memo-placeholder",
          })}
          memoConfig={memoConfig}
        />
      </Styles.Container>
    </HeaderLayout>
  );
});

const parseAddressForAll = (str: string) => {
  const icnsOrEnsLabel = str.split(".")[1];
  const bech32Prefix = str.split("1")[0];
  const isEvmAddress =
    str.startsWith("0x") &&
    str.length === 42 &&
    str.match(/^0x[0-9a-fA-F]{40}$/);
  const isStarknetAddress =
    str.startsWith("0x") &&
    str.length === 66 &&
    str.match(/^0x[0-9a-fA-F]{64}$/);

  if (isEvmAddress) {
    return { form: "address", chainPrefix: "eth", value: str };
  }

  if (icnsOrEnsLabel === "eth") {
    return { form: "name-service", chainPrefix: "eth", value: str };
  }

  if (isStarknetAddress) {
    return { form: "address", chainPrefix: "stark", value: str };
  }

  if (icnsOrEnsLabel) {
    return {
      form: "name-service",
      chainPrefix: icnsOrEnsLabel,
      value: str,
    };
  }

  if (bech32Prefix) {
    return {
      form: "address",
      chainPrefix: bech32Prefix,
      value: str,
    };
  }

  return {
    form: "none",
    chainPrefix: "",
    value: "str",
  };
};
