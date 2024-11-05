import React, { FunctionComponent, useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Stack } from "../../../components/stack";
import { BackButton } from "../../../layouts/header/components";
import { TextInput } from "../../../components/input";
import { HeaderLayout } from "../../../layouts/header";
import { useForm } from "react-hook-form";
import { useStore } from "../../../stores";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router";
import { useInteractionInfo } from "../../../hooks";
import { InteractionWaitingData } from "@keplr-wallet/background";
import { useIntl } from "react-intl";
import { handleExternalInteractionWithNoProceedNext } from "../../../utils";

const Styles = {
  Container: styled(Stack)`
    height: 100%;

    padding: 0.75rem;

    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  `,
};

interface FormData {
  name: string;
}

export const WalletChangeNamePage: FunctionComponent = observer(() => {
  const { keyRingStore, interactionStore } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intl = useIntl();

  const vaultId = searchParams.get("id");
  const walletName = useMemo(() => {
    return keyRingStore.keyInfos.find((info) => info.id === vaultId);
  }, [keyRingStore.keyInfos, vaultId]);

  const {
    handleSubmit,
    register,
    setFocus,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
    },
  });

  // 이 페이지는 외부에서 changeKeyRingName api로 접근할 수도 있으므로
  // 인터렉션이 필요한 경우 따로 처리를 해줘야한다.
  const interactionInfo = useInteractionInfo(() => {
    interactionStore.rejectAll("change-keyring-name");
  });
  const interactionData: InteractionWaitingData | undefined =
    interactionStore.getAllData("change-keyring-name")[0];

  useEffect(() => {
    if (interactionData?.data) {
      const defaultName = (interactionData.data as any).defaultName;
      if (defaultName) {
        setValue("name", defaultName);
      }
    }
  }, [interactionData?.data, setValue]);

  const notEditable =
    interactionData?.data != null &&
    (interactionData.data as any).editable === false;

  useEffect(() => {
    setFocus("name");
  }, [setFocus]);

  return (
    <HeaderLayout
      title={intl.formatMessage({
        id: "page.wallet.keyring-item.dropdown.change-wallet-name-title",
      })}
      left={
        <BackButton
          hidden={
            interactionInfo.interaction && !interactionInfo.interactionInternal
          }
        />
      }
      bottomButtons={[
        {
          text: intl.formatMessage({ id: "button.save" }),
          color: "secondary",
          size: "large",
          type: "submit",
          isLoading: (() => {
            if (!interactionInfo.interaction) {
              return false;
            }

            return interactionStore.isObsoleteInteraction(interactionData?.id);
          })(),
        },
      ]}
      onSubmit={handleSubmit(async (data) => {
        try {
          if (vaultId) {
            if (
              interactionInfo.interaction &&
              !interactionInfo.interactionInternal
            ) {
              await interactionStore.approveWithProceedNextV2(
                interactionStore
                  .getAllData("change-keyring-name")
                  .map((data) => data.id),
                data.name,
                (proceedNext) => {
                  if (!proceedNext) {
                    handleExternalInteractionWithNoProceedNext();
                  }
                }
              );
            } else {
              await keyRingStore.changeKeyRingName(vaultId, data.name);

              navigate(-1);
            }
          }
        } catch (e) {
          console.log(e);
        }
      })}
    >
      <Styles.Container>
        <TextInput
          label={intl.formatMessage({
            id: "page.wallet.change-name.previous-name-input-label",
          })}
          disabled
          value={walletName?.name}
        />

        <TextInput
          label={intl.formatMessage({
            id: "page.wallet.change-name.new-name-input-label",
          })}
          error={errors.name && errors.name.message}
          disabled={notEditable}
          {...register("name", { required: true })}
        />
      </Styles.Container>
    </HeaderLayout>
  );
});
