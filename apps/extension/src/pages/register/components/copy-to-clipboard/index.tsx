import { Columns } from "../../../../components/column";
import { Button1 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { TextButton } from "../../../../components/button-text";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import lottie from "lottie-web";
import AnimCheck from "../../../../public/assets/lottie/register/check-circle-icon.json";
import AnimCheckLight from "../../../../public/assets/lottie/register/check-circle-icon-light.json";
import { FormattedMessage } from "react-intl";

import styled, { useTheme } from "styled-components";

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
`;

export const CopyToClipboard: FunctionComponent<{ text: string }> = ({
  text,
}) => {
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
