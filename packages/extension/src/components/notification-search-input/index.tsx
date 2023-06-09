import React from "react";
import style from "./style.module.scss";
import searchIcon from "@assets/icon/search.png";

export const SearchInput = ({
  inputVal,
  handleSearch,
  setInputVal,
  searchTitle,
}: {
  inputVal: string;
  handleSearch: any;
  setInputVal: any;
  searchTitle?: string;
}) => {
  return (
    <div className={style.searchContainer}>
      <div className={style.searchBox}>
        <img draggable={false} src={searchIcon} alt="search" />
        <input
          placeholder={searchTitle ? searchTitle : "Search"}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyUp={handleSearch}
        />
      </div>
    </div>
  );
};
