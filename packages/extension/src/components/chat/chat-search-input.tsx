import amplitude from "amplitude-js";
import React from "react";
import { useHistory } from "react-router";
import newChatIcon from "@assets/icon/new-chat.png";
import searchIcon from "@assets/icon/search.png";
import style from "./style.module.scss";

export const ChatSearchInput = ({
  searchInput,
  handleSearch,
  setSearchInput,
}: {
  searchInput: string;
  handleSearch: any;
  setSearchInput: any;
}) => {
  const history = useHistory();
  return (
    <div className={style.searchContainer}>
      <div className={style.searchBox}>
        <img draggable={false} src={searchIcon} alt="search" />
        <input
          placeholder="Search by name or address"
          value={searchInput}
          onKeyUp={handleSearch}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      <div
        onClick={() => {
          amplitude.getInstance().logEvent("New chat click", {});
          history.push("/newChat");
        }}
      >
        <img
          draggable={false}
          className={style.newChatIcon}
          src={newChatIcon}
          alt=""
        />
      </div>
    </div>
  );
};
