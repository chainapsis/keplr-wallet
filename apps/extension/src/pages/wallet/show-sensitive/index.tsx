import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { ColorPalette } from "../../../styles";
import { Button1, Subtitle3 } from "../../../components/typography";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { TextInput } from "../../../components/input";
import { useForm } from "react-hook-form";
import { useStore } from "../../../stores";
import { useSearchParams } from "react-router-dom";
import { Box } from "../../../components/box";
import { Gutter } from "../../../components/gutter";
import lottie from "lottie-web";
import AniMnemonic from "../../../public/assets/lottie/wallet/mnemonic.json";
import { useNavigate } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import styled, { useTheme } from "styled-components";
import AnimCheckLight from "../../../public/assets/lottie/register/check-circle-icon-light.json";
import AnimCheck from "../../../public/assets/lottie/register/check-circle-icon.json";
import { Columns } from "../../../components/column";
import {
  TextButton,
  Styles as TextButtonStyles,
} from "../../../components/button-text";

interface FormData {
  password: string;
}

export const WalletShowSensitivePage: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const intl = useIntl();
  const theme = useTheme();

  const animDivRef = useRef<HTMLDivElement | null>(null);

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

  const [sensitive, setSensitive] = useState("");

  useEffect(() => {
    setFocus("password");

    if (animDivRef.current) {
      const anim = lottie.loadAnimation({
        container: animDivRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: AniMnemonic,
      });

      return () => {
        anim.destroy();
      };
    }
  }, [setFocus]);

  return (
    <HeaderLayout
      title={(() => {
        const keyInfo = keyRingStore.keyInfos.find(
          (keyInfo) => keyInfo.id === vaultId
        );
        if (keyInfo && keyInfo.type === "private-key") {
          return intl.formatMessage({
            id: "page.wallet.keyring-item.dropdown.view-private-key-title",
          });
        }

        return intl.formatMessage({
          id: "page.wallet.keyring-item.dropdown.view-recovery-path-title",
        });
      })()}
      left={<BackButton />}
      fixedHeight={true}
      bottomButtons={[
        sensitive === ""
          ? {
              color: "secondary",
              text: intl.formatMessage({
                id: "button.confirm",
              }),
              size: "large",
              type: "submit",
            }
          : {
              color: "secondary",
              text: intl.formatMessage({
                id: "button.close",
              }),
              size: "large",
              type: "button",
              onClick: () => {
                navigate("/", {
                  replace: true,
                });
              },
            },
      ]}
      onSubmit={
        sensitive === ""
          ? handleSubmit(async (data) => {
              try {
                if (vaultId) {
                  const result = await keyRingStore.showKeyRing(
                    vaultId,
                    data.password
                  );
                  setSensitive(result);
                }
              } catch (e) {
                console.log("Fail to decrypt: " + e.message);
                setError("password", {
                  type: "custom",
                  message: intl.formatMessage({ id: "error.invalid-password" }),
                });
              }
            })
          : undefined
      }
    >
      <Box
        padding="0.75rem"
        paddingTop="0.5rem"
        paddingBottom="0"
        height="100%"
      >
        {sensitive === "" ? (
          <React.Fragment>
            <Box alignX="center" alignY="center" style={{ flex: 1 }}>
              <div
                ref={animDivRef}
                style={{
                  backgroundColor:
                    theme.mode === "light" ? "none" : ColorPalette["gray-600"],
                  borderRadius: "2.5rem",
                  width: "8.5rem",
                  height: "8.5rem",
                }}
              />

              <Gutter size="2rem" />

              <Subtitle3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-200"]
                }
              >
                <FormattedMessage id="page.wallet.show-sensitive.paragraph" />
              </Subtitle3>
            </Box>
            <TextInput
              label={intl.formatMessage({
                id: "page.wallet.show-sensitive.password-label",
              })}
              type="password"
              error={errors.password && errors.password.message}
              {...register("password", { required: true })}
            />
          </React.Fragment>
        ) : (
          <Box
            paddingX="1.75rem"
            paddingY="1.25rem"
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette.white
                : ColorPalette["gray-600"]
            }
            borderRadius="0.5rem"
            minHeight="10.25rem"
            style={{
              border:
                theme.mode === "light"
                  ? `1px solid ${ColorPalette["gray-100"]}`
                  : "none",
              textAlign: "center",
              lineBreak: sensitive.trim().includes(" ") ? "auto" : "anywhere",
            }}
          >
            <Subtitle3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-400"]
                  : ColorPalette["gray-50"]
              }
            >
              {sensitive}
            </Subtitle3>
            <div style={{ flex: 1 }} />
            <CopyToClipboard text={sensitive} />
          </Box>
        )}
      </Box>
    </HeaderLayout>
  );
});

const SVGNoneTextButton = styled(TextButton)`
  svg {
    fill: none;
    stroke: none;
  }

  :hover {
    svg {
      fill: none;
      stroke: none;
    }
  }

  ${TextButtonStyles.Button} {
    color: ${({ theme }) =>
      theme.mode === "light"
        ? ColorPalette["blue-400"]
        : ColorPalette["gray-50"]};

    :hover {
      color: ${({ theme }) =>
        theme.mode === "light"
          ? ColorPalette["blue-500"]
          : ColorPalette["gray-200"]};
    }
  }
`;

const CopyToClipboard: FunctionComponent<{ text: string }> = ({ text }) => {
  const [hasCopied, setHasCopied] = useState(false);

  const checkAnimDivRef = useRef<HTMLDivElement | null>(null);

  const theme = useTheme();

  useEffect(() => {
    if (checkAnimDivRef.current) {
      const anim = lottie.loadAnimation({
        container: checkAnimDivRef.current,
        renderer: "svg",
        autoplay: true,
        loop: false,
        animationData: theme.mode === "light" ? AnimCheckLight : AnimCheck,
      });

      return () => {
        anim.destroy();
      };
    }
  }, [hasCopied]);

  return (
    <SVGNoneTextButton
      text={
        hasCopied ? (
          <Columns sum={1} gutter="0.25rem">
            <Button1 color={ColorPalette["green-400"]}>
              <FormattedMessage id="pages.register.components.copy-to-clipboard.button-after" />
            </Button1>
            <div
              style={{ width: "1.125rem", height: "1.125rem" }}
              ref={checkAnimDivRef}
            />
          </Columns>
        ) : (
          <FormattedMessage id="pages.register.components.copy-to-clipboard.button-before" />
        )
      }
      size="large"
      onClick={async () => {
        await navigator.clipboard.writeText(text);

        setHasCopied(true);

        setTimeout(() => {
          setHasCopied(false);
        }, 1000);
      }}
    />
  );
};
