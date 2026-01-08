import React, {
  Component,
  ErrorInfo,
  FunctionComponent,
  PropsWithChildren,
  useState,
} from "react";
import { Box } from "./components/box";
import { H1, Subtitle4 } from "./components/typography";
import { ExclamationTriangleIcon } from "./components/icon";
import { ColorPalette } from "./styles";
import { Gutter } from "./components/gutter";
import { Button } from "./components/button";
import { observer } from "mobx-react-lite";
import { useStore } from "./stores";
import { useTheme } from "styled-components";
import {
  ClearAllIBCHistoryMsg,
  ClearAllSkipHistoryMsg,
  ClearAllSwapV2HistoryMsg,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<PropsWithChildren, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return <ErrorBoundaryView />;
    }

    return this.props.children;
  }
}

const ErrorBoundaryView: FunctionComponent = observer(() => {
  const { chainStore, uiConfigStore } = useStore();
  const theme = useTheme();

  const [isLoading, setIsLoading] = useState(false);

  const resetStoreQueries = async () => {
    const fn1 = async () => {
      const prefixes = [
        "store_queries/",
        "store_prices/",
        "store_ibc_curreny_registrar/",
        "store_lsm_currency_registrar/",
        "store_gravity_bridge_currency_registrar/",
        "store_axelar_evm_bridge_currency_registrar/",
      ];

      const storageList = await browser.storage.local.get();
      const storeQueriesKeys = Object.keys(storageList).filter((key) => {
        for (const prefix of prefixes) {
          if (key.startsWith(prefix)) {
            return true;
          }
        }
        return false;
      });
      await browser.storage.local.remove(storeQueriesKeys);
    };

    const fn2 = async () => {
      const msg = new ClearAllIBCHistoryMsg();
      const requester = new InExtensionMessageRequester();
      await requester.sendMessage(BACKGROUND_PORT, msg);
    };

    const fn3 = async () => {
      const msg = new ClearAllSkipHistoryMsg();
      const requester = new InExtensionMessageRequester();
      await requester.sendMessage(BACKGROUND_PORT, msg);
    };

    const fn4 = async () => {
      const msg = new ClearAllSwapV2HistoryMsg();
      const requester = new InExtensionMessageRequester();
      await requester.sendMessage(BACKGROUND_PORT, msg);
    };

    const fn5 = async () => {
      await uiConfigStore.removeStatesWhenErrorOccurredDuringRending();
    };

    await Promise.allSettled([fn1(), fn2(), fn3(), fn4(), fn5()]);
  };

  return (
    <Box height="100vh" padding="1.375rem" alignX="center" alignY="center">
      <ExclamationTriangleIcon
        width="4.75rem"
        height="4.75rem"
        color={
          theme.mode === "light"
            ? ColorPalette["orange-400"]
            : ColorPalette["gray-10"]
        }
      />
      <H1
        color={
          theme.mode === "light"
            ? ColorPalette["orange-400"]
            : ColorPalette["gray-10"]
        }
      >
        Error
      </H1>

      <Gutter size="1.5rem" />

      <Subtitle4
        color={
          theme.mode === "light"
            ? ColorPalette["gray-400"]
            : ColorPalette["gray-200"]
        }
        style={{ textAlign: "center" }}
      >
        An error with an unknown reason has occurred. To potentially resolve the
        issue, we recommend deleting the cache data. However, please note that
        we cannot guarantee this will fix the problem.
      </Subtitle4>

      <Gutter size="1.25rem" />

      <Button
        text="Reset Cache Data"
        color="secondary"
        size="medium"
        style={{ width: "100%" }}
        onClick={async () => {
          if (isLoading) {
            return;
          }

          setIsLoading(true);

          try {
            await resetStoreQueries();

            window.location.reload();
          } finally {
            setIsLoading(false);
          }
        }}
      />

      <Gutter size="2.625rem" />

      <Subtitle4
        color={
          theme.mode === "light"
            ? ColorPalette["gray-400"]
            : ColorPalette["gray-200"]
        }
        style={{ textAlign: "center" }}
      >
        If the error persists, you can also try resetting the suggest chains and
        your custom endpoints.
      </Subtitle4>

      <Gutter size="1.5rem" />

      <Button
        text={
          <Box style={{ padding: "0.875rem 1rem" }}>
            Reset Cache Data, Including
            <br />
            Suggest Chains & Endpoints
          </Box>
        }
        color="danger"
        style={{ width: "100%" }}
        onClick={async () => {
          if (isLoading) {
            return;
          }

          setIsLoading(true);

          try {
            await resetStoreQueries();

            await Promise.all([
              chainStore.clearAllChainEndpoints(),
              chainStore.clearClearAllSuggestedChainInfos(),
            ]);

            window.location.reload();
          } finally {
            setIsLoading(false);
          }
        }}
      />
    </Box>
  );
});
