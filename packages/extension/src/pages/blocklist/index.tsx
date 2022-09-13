import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";
import style from "./style.module.scss";

export const BlocklistPage: FunctionComponent = () => {
  return (
    <div className={style.container}>
      <div className={style.inner}>
        <h1>Scam Warning</h1>
        <p>
          This domain is listed on the Keplr domain warning list, meaning this
          is a phishing site. <br /> We recommend you to close this website
          right away.
        </p>
      </div>
    </div>
  );
};

ReactDOM.render(<BlocklistPage />, document.getElementById("app"));
