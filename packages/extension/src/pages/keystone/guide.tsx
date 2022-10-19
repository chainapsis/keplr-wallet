import React from "react";
import { Button } from "reactstrap";
import style from "./style.module.scss";

export function Guide({ onScan }: { onScan(): void }) {
  return (
    <div className={style.page}>
      <div>Connect</div>
      <Button color="primary" block onClick={onScan}>
        Scan the QR code
      </Button>
    </div>
  );
}
