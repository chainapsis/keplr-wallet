import React from "react";
import style from "./style.module.scss";
import searchIcon from "@assets/icon/search.png";

export const NotificationSearchInput = ({
  inputVal,
  handleSearch,
  setInputVal,
}: {
  inputVal: string;
  handleSearch: any;
  setInputVal: any;
}) => {
  return (
    <div className={style.searchContainer}>
      <div className={style.searchBox}>
        <img draggable={false} src={searchIcon} alt="search" />
        <input
          placeholder="Search"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyUp={handleSearch}
        />
      </div>
    </div>
  );
};
