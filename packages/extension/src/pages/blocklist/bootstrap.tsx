import React from "react";
import ReactDOM from "react-dom";

const BlocklistPage = React.lazy(() => import("./index"));

ReactDOM.render(<BlocklistPage />, document.getElementById("app"));
