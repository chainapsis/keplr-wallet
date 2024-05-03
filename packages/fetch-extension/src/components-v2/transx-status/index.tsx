import React, { useState } from "react";
// import style from "./style.module.scss";
import { Dropdown } from "@components-v2/dropdown";
import { TransxPending } from "./transx-pending";
import { TransxSuccess } from "./transx-success";
import { TransxFailed } from "./transx-failed";

export const TransxStatus = ({ status }: { status: string }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div>
      <Dropdown
        title={""}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        closeClicked={() => setIsOpen(false)}
        showCloseIcon={false}
        showTopNav={true}
      >
        {status === "pending" && <TransxPending />}
        {status === "success" && <TransxSuccess />}
        {status === "failed" && <TransxFailed />}
      </Dropdown>
    </div>
  );
};
