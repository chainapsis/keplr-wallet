import React, { FunctionComponent } from "react";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import { IEthTxRenderRegistry, IEthTxRenderer } from "./types";
import { UnsignedTransaction } from "@ethersproject/transactions";
import { EthSendTokenTx } from "./render";

export class EthTxRenderRegistry implements IEthTxRenderRegistry {
  protected renderers: IEthTxRenderer[] = [];

  register(renderer: IEthTxRenderer): void {
    this.renderers.push(renderer);
  }

  render(
    chainId: string,
    unsignedTx: UnsignedTransaction
  ): {
    content: string | React.ReactElement;
  } {
    try {
      for (const renderer of this.renderers) {
        const res = renderer.process(chainId, unsignedTx);
        if (res) {
          return res;
        }
      }
    } catch (e) {
      console.log(e);
      // Fallback to unknown content.
    }

    return {
      content: (
        <UnknownContent>{JSON.stringify(unsignedTx, null, 2)}</UnknownContent>
      ),
    };
  }
}

const UnknownContent: FunctionComponent = ({ children }) => {
  const theme = useTheme();
  return (
    <pre
      style={{
        margin: 0,
        color:
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-200"],
      }}
    >
      {children}
    </pre>
  );
};

export const defaultRegistry = new EthTxRenderRegistry();

defaultRegistry.register(EthSendTokenTx);
