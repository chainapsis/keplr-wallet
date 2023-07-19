import React, { useState } from "react";
import style from "./style.module.scss";
import { useHistory } from "react-router-dom";

export const SearchInput = () => {
  const history = useHistory();

  const [searchText, setSearchText] = useState("");
  const [invalidDomain, setInvalidDomain] = useState(false);

  function processString(input: string) {
    const regexPattern = /^(?!.*[^\w!@$]|.*(?<!\.fet)$)(?!\S*\s)\S{1,64}$/;
    const trimmedString = input.trim();
    const lowercasedString = trimmedString.toLowerCase();

    if (!regexPattern.test(lowercasedString)) {
      setInvalidDomain(true);
      if (!lowercasedString.endsWith(".fet")) {
        return lowercasedString + ".fet";
      } else {
        return lowercasedString;
      }
    } else {
      setInvalidDomain(false);
      return lowercasedString;
    }
  }

  const handleSearch = () => {
    if (searchText.trim() !== "") {
      setSearchText("");
      console.log(processString(searchText));
      history.push(
        `/fetch-name-service/domain-details/${processString(searchText)}`
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setInvalidDomain(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <React.Fragment>
      <div className={style.searchContainer}>
        <input
          type="text"
          value={searchText}
          className={style.inputStyle}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Search a .FET name"
        />
        <button
          className={style.buttonStyle}
          onClick={handleSearch}
          disabled={searchText.trim() === ""}
        >
          SEARCH
        </button>
      </div>
      {invalidDomain && (
        <div className={style.invalidText}>Invalid .FET domain name !</div>
      )}
    </React.Fragment>
  );
};
