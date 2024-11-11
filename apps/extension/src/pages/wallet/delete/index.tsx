import React, { FunctionComponent, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { GuideBox } from "../../../components/guide-box";
import { Subtitle3, Subtitle4 } from "../../../components/typography";
import styled from "styled-components";
import { Stack } from "../../../components/stack";
import { ColorPalette } from "../../../styles";
import { TextInput } from "../../../components/input";
import { useStore } from "../../../stores";
import { useSearchParams, Link } from "react-router-dom";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import lottie from "lottie-web";
import AnimSeed from "../../../public/assets/lottie/wallet/delete.json";
import { YAxis } from "../../../components/axis";
import { FormattedMessage, useIntl } from "react-intl";
import { dispatchGlobalEventExceptSelf } from "../../../utils/global-events";

const Styles = {
  Container: styled(Stack)`
    height: 100%;

    padding: 0.75rem;
  `,
  Flex1: styled.div`
    flex: 1;
  `,
  BackUp: styled(Subtitle4)`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["orange-400"]
        : ColorPalette["yellow-400"]};
    text-decoration: underline;
  `,
  Paragraph: styled(Subtitle3)`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-300"]
        : ColorPalette["gray-200"]};
    text-align: center;

    padding: 0 0.5rem;
  `,
};

interface FormData {
  password: string;
}

export const WalletDeletePage: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intl = useIntl();

  const vaultId = searchParams.get("id");

  const {
    register,
    handleSubmit,
    setFocus,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      password: "",
    },
  });

  const animDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setFocus("password");

    if (animDivRef.current) {
      const anim = lottie.loadAnimation({
        container: animDivRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: AnimSeed,
      });

      return () => {
        anim.destroy();
      };
    }
  }, [setFocus]);

  return (
    <HeaderLayout
      title={intl.formatMessage({
        id: "page.wallet.keyring-item.dropdown.delete-wallet-title",
      })}
      fixedHeight={true}
      left={<BackButton />}
      bottomButtons={[
        {
          text: intl.formatMessage({ id: "button.confirm" }),
          color: "secondary",
          size: "large",
          type: "submit",
        },
      ]}
      onSubmit={handleSubmit(async (data) => {
        try {
          if (vaultId) {
            await keyRingStore.deleteKeyRing(vaultId, data.password);

            dispatchGlobalEventExceptSelf("keplr_keyring_changed");

            navigate(-1);
          }
        } catch (e) {
          console.log("Fail to decrypt: " + e.message);
          setError("password", {
            type: "custom",
            message: intl.formatMessage({ id: "error.invalid-password" }),
          });
        }
      })}
    >
      <Styles.Container>
        {(() => {
          const keyInfo = keyRingStore.keyInfos.find(
            (keyInfo) => keyInfo.id === vaultId
          );
          if (!keyInfo) {
            return null;
          }

          if (keyInfo.type === "mnemonic" || keyInfo.type === "private-key") {
            return (
              <GuideBox
                color="warning"
                title={intl.formatMessage({
                  id: "page.wallet.delete.warning-title",
                })}
                paragraph={intl.formatMessage({
                  id: "page.wallet.delete.warning-paragraph",
                })}
                bottom={
                  <Link to={`/wallet/show-sensitive?id=${keyInfo.id}`}>
                    <Styles.BackUp>
                      <FormattedMessage id="page.wallet.delete.warning-link-text" />
                    </Styles.BackUp>
                  </Link>
                }
              />
            );
          }

          return null;
        })()}

        <YAxis alignX="center">
          <div
            ref={animDivRef}
            style={{
              width: "10.5rem",
              height: "10.5rem",
            }}
          />
        </YAxis>

        <Styles.Paragraph>
          <FormattedMessage id="page.wallet.delete.paragraph" />
        </Styles.Paragraph>

        <Styles.Flex1 />

        <TextInput
          label={intl.formatMessage({
            id: "page.wallet.delete.password-input-label",
          })}
          type="password"
          error={errors.password && errors.password.message}
          {...register("password", { required: true })}
        />
      </Styles.Container>
    </HeaderLayout>
  );
});
