import React from "react";

import { ToolTip } from "../tooltip";

export interface AddressProps {
  maxCharacters: number;
  children: string;
  tooltipFontSize?: string;
  tooltipAddress?: string;

  lineBreakBeforePrefix?: boolean;
}

export class Address extends React.Component<AddressProps> {
  copyRef = React.createRef<HTMLDivElement>();

  componentDidMount(): void {
    if (this.copyRef.current) {
      this.copyRef.current.addEventListener("copy", this.onCopy);
    }
  }

  componentWillUnmount(): void {
    if (this.copyRef.current) {
      this.copyRef.current.removeEventListener("copy", this.onCopy);
    }
  }

  render() {
    const { tooltipFontSize, lineBreakBeforePrefix, children } = this.props;

    const tooltipAddress = this.props.tooltipAddress
      ? this.props.tooltipAddress
      : children;

    return (
      <ToolTip
        trigger="hover"
        options={{ placement: "top" }}
        tooltip={
          <div
            ref={this.copyRef}
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
        {this.shortenAddress(children)}
      </ToolTip>
    );
  }

  onCopy = async (e: ClipboardEvent) => {
    if (e.clipboardData) {
      // Remove line breaks.
      const pre = await navigator.clipboard.readText();
      await navigator.clipboard.writeText(pre.replace(/(\r\n|\n|\r)/gm, ""));
    }
  };

  shortenAddress(bech32: string): string {
    let { maxCharacters } = this.props;

    if (maxCharacters >= bech32.length) {
      return bech32;
    }

    const i = bech32.indexOf("1");
    const prefix = bech32.slice(0, i);
    const address = bech32.slice(i + 1);

    maxCharacters -= prefix.length;
    maxCharacters -= 3; // For "..."
    maxCharacters -= 1; // For "1"

    if (maxCharacters <= 0) {
      return "";
    }

    const mid = Math.floor(address.length / 2);
    let former = address.slice(0, mid);
    let latter = address.slice(mid);

    while (maxCharacters < former.length + latter.length) {
      if ((former.length + latter.length) % 2 === 1 && former.length > 0) {
        former = former.slice(0, former.length - 1);
      } else {
        latter = latter.slice(1);
      }
    }

    return prefix + "1" + former + "..." + latter;
  }
}
