import { Columns } from "../../../../components/column";
import { Button1 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { TextButton } from "../../../../components/button-text";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import lottie from "lottie-web";
import AnimCheck from "../../../../public/assets/lottie/register/check_circle-icon.json";

export const CopyToClipboard: FunctionComponent<{ text: string }> = ({
  text,
}) => {
  const [hasCopied, setHasCopied] = useState(false);

  const checkAnimDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (checkAnimDivRef.current) {
      const anim = lottie.loadAnimation({
        container: checkAnimDivRef.current,
        renderer: "svg",
        autoplay: true,
        loop: false,
        animationData: AnimCheck,
      });

      return () => {
        anim.destroy();
      };
    }
  }, [hasCopied]);

  return (
    <TextButton
      text={
        hasCopied ? (
          <Columns sum={1} gutter="0.25rem">
            <Button1 color={ColorPalette["green-400"]}>Copied</Button1>
            <div
              style={{ width: "1.125rem", height: "1.125rem" }}
              ref={checkAnimDivRef}
            />
          </Columns>
        ) : (
          "Copy to clipboard"
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
