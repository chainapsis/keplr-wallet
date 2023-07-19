import React, { useState } from "react";
import style from "./style.module.scss";
import { useHistory } from "react-router-dom";

export const SearchInput = () => {
  const history = useHistory();

  const [searchText, setSearchText] = useState("");
  const [invalidDomain, setInvalidDomain] = useState(false);

  function processString(input: string): string {
    const regexPattern = /^(?!.*[^\w!@$]|.*(?<!\.fet)$).{1,64}$/;
    const trimmedString = input.trim();
    const lowercasedString = trimmedString.toLowerCase();
    if (!regexPattern.test(lowercasedString)) {
      setInvalidDomain(true);
      return lowercasedString;
    }
    if (lowercasedString.endsWith(".fet")) {
      return lowercasedString;
    }
    return lowercasedString + ".fet";
  }

  const handleSearch = () => {
    if (searchText.trim() !== "") {
      setSearchText("");
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
      <div className={style.invalidText}>
        {invalidDomain && "Invalid .FET domain name !"}
      </div>
    </React.Fragment>
  );
};
