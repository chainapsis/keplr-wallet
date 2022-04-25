import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { Banner } from "./components/banner";

const Application = React.lazy(() => import("./index"));

const LoadingScreen: React.FC = () => {
  return (
    <Banner
      icon={require("./public/assets/temp-icon.svg")}
      logo={require("./public/assets/logo-temp.png")}
    />
  );
};

const Bootloader: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Application />
    </Suspense>
  );
};

ReactDOM.render(<Bootloader />, document.getElementById("app"));
