import React, {
  Component,
  ErrorInfo,
  FunctionComponent,
  ReactNode,
} from "react";
import { Box } from "./components/box";
import { H1, Subtitle4 } from "./components/typography";
import { ExclamationTriangleIcon } from "./components/icon";
import { ColorPalette } from "./styles";
import { Gutter } from "./components/gutter";
import { Button } from "./components/button";
import { observer } from "mobx-react-lite";
import { useStore } from "./stores";

interface Prop {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Prop, State> {
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
  const { chainStore } = useStore();

  const resetStoreQueries = async () => {
    const storageList = await browser.storage.local.get();
    const storeQueriesKeys = Object.keys(storageList).filter((key) =>
      key.includes("store_queries")
    );
    await browser.storage.local.remove(storeQueriesKeys);
  };

  return (
    <Box height="100vh" padding="1.375rem" alignX="center" alignY="center">
      <ExclamationTriangleIcon
        width="4.75rem"
        height="4.75rem"
        color={ColorPalette["gray-10"]}
      />
      <H1>Error</H1>

      <Gutter size="1.5rem" />

      <Subtitle4
        color={ColorPalette["gray-200"]}
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
          await resetStoreQueries();

          window.location.reload();
        }}
      />

      <Gutter size="2.625rem" />

      <Subtitle4
        color={ColorPalette["gray-200"]}
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
          await resetStoreQueries();

          chainStore.clearAllChainEndpoints();
          chainStore.clearClearAllSuggestedChainInfos();

          window.location.reload();
        }}
      />
    </Box>
  );
});
