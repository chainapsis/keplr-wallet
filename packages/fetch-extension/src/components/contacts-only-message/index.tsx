import React from "react";
import { useNavigate } from "react-router";
import style from "./style.module.scss";

export const ContactsOnlyMessage = () => {
  const navigate = useNavigate();

  return (
    <div className={style["resultText"]}>
      If you are searching for an address not in your address book, you
      can&apos;t see them due to your selected privacy settings being
      &quot;contact only&quot;. Please add the address to your address book to
      be able to chat with them or change your privacy settings.
      <br />
      <a
        href="#"
        style={{
          textDecoration: "underline",
        }}
        onClick={(e) => {
          e.preventDefault();
          navigate("/setting/chat/privacy");
        }}
      >
        Go to chat privacy settings
      </a>
    </div>
  );
};
