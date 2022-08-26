import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
} from "react";

import { ToolTip } from "../tooltip";
import { Bech32Address } from "@keplr-wallet/cosmos";

export interface AddressProps {
  children: string;
  tooltipFontSize?: string;
  tooltipAddress?: string;
}

export interface Bech32AddressProps {
  maxCharacters: number;
  lineBreakBeforePrefix?: boolean;
  isRaw?: false;
}

export interface RawAddressProps {
  isRaw: true;
}

export const Address: FunctionComponent<
  AddressProps & (Bech32AddressProps | RawAddressProps)
> = (props) => {
  const { tooltipFontSize, children } = props;
  const tooltipAddress = props.tooltipAddress ? props.tooltipAddress : children;

  const copyRef = useRef<HTMLDivElement>(null);

  const onCopy = useCallback(async (e: ClipboardEvent) => {
    if (e.clipboardData) {
      // Remove line breaks.
      const pre = await navigator.clipboard.readText();
      await navigator.clipboard.writeText(pre.replace(/(\r\n|\n|\r)/gm, ""));
    }
  }, []);

  useEffect(() => {
    if (copyRef.current) {
      copyRef.current.addEventListener("copy", onCopy);
    }
    return () => {
      if (copyRef.current) {
        copyRef.current.removeEventListener("copy", onCopy);
      }
    };
  }, [copyRef, onCopy]);

  if ("maxCharacters" in props) {
    const { lineBreakBeforePrefix } = props;

    return (
      <ToolTip
        trigger="hover"
        options={{ placement: "top" }}
        tooltip={
          <div
            ref={copyRef}
            className="address-tooltip"
            style={{ fontSize: tooltipFontSize }}
          >
            {lineBreakBeforePrefix && tooltipAddress.length > 0
              ? tooltipAddress.split("1").map((item, i) => {
                  if (i === 0) {
                    return <div key={i}>{item + "1"}</div>;
                  }
                  return <div key={i}>{item}</div>;
                })
              : tooltipAddress}
          </div>
        }
      >
        {Bech32Address.shortenAddress(children, props.maxCharacters)}
      </ToolTip>
    );
  }

  return (
    <ToolTip
      trigger="hover"
      options={{ placement: "top" }}
      tooltip={
        <div
          ref={copyRef}
          className="address-tooltip"
          style={{ fontSize: tooltipFontSize }}
        >
          {tooltipAddress}
        </div>
      }
    >
      {children}
    </ToolTip>
  );
};
