import React from "react";
import ReactDOM from "react-dom";

const LedgerGrantFullScreenPage = React.lazy(() => import("./index"));

ReactDOM.render(<LedgerGrantFullScreenPage />, document.getElementById("app"));
