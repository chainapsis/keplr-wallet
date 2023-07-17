import React, { useState } from "react";
import style from "./style.module.scss";
import { useHistory } from "react-router-dom";

export const SearchInput = () => {
  const history = useHistory();

  const [searchText, setSearchText] = useState("");

  function processString(input: string): string {
    const trimmedString = input.trim();
    const lowercasedString = trimmedString.toLowerCase();
    if (lowercasedString.endsWith(".fet")) {
      return lowercasedString;
    }
    return lowercasedString + ".fet";
  }
  const handleSearch = () => {
    setSearchText("");
    history.push({
      pathname: "/fetch-name-service/domain-details",
      state: {
        domainName: processString(searchText),
      },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  return (
    <div className={style.searchContainer}>
      <input
        type="text"
        value={searchText}
        className={style.inputStyle}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="Search for a .FET name"
      />
      <button className={style.buttonStyle} onClick={handleSearch}>
        SEARCH
      </button>
    </div>
  );
};
