import React, {
  Component,
  ErrorInfo,
  FunctionComponent,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { Button } from "reactstrap";

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  {
    // noop
  },
  State
> {
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
  const [isLoading, setIsLoading] = useState(false);

  const resetStoreQueries = async () => {
    const storageList = await browser.storage.local.get();
    const storeQueriesKeys = Object.keys(storageList).filter((key) =>
      key.startsWith("store_queries/")
    );
    await browser.storage.local.remove(storeQueriesKeys);
  };

  return (
    <div>
      <span>
        {" "}
        An error with an unknown reason has occurred. To potentially resolve the
        issue, we recommend deleting the cache data. However, please note that
        we cannot guarantee this will fix the problem.
      </span>
      <Button
        text="Reset Cache Data"
        color="primary"
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
      >
        Reset Cache Data
      </Button>
    </div>
  );
});
