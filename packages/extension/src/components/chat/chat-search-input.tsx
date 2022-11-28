import React from "react";
import { useHistory } from "react-router";
import newChatIcon from "../../public/assets/icon/new-chat.png";
import searchIcon from "../../public/assets/icon/search.png";
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
        <img src={searchIcon} alt="search" />
        <input
          placeholder="Search by name or address"
          value={searchInput}
          onKeyUp={handleSearch}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      <div onClick={() => history.push("/newChat")}>
        <img style={{ cursor: "pointer" }} src={newChatIcon} alt="" />
      </div>
    </div>
  );
};
