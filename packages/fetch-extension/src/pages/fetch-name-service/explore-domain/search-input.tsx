import React, { useState } from "react";
import style from "./style.module.scss";
import { useNavigate } from "react-router-dom";

export const SearchInput = () => {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [invalidDomain, setInvalidDomain] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validation = (string: string) => {
    const invalidCharacters = ["$", "%", "/", "|", "\\", ":", ";", "."];
    if (string.split("").some((char) => invalidCharacters.includes(char))) {
      return "Invalid special characters";
    }
    if (string.length > 64) return "Character limit exceeded (Max : 64 chars)";
    if (string.includes(" ")) {
      return "Domain Name Cannot have spaces";
    }
    return "";
  };

  function processString(input: string) {
    if (!input.endsWith(".fet")) {
      return input + ".fet";
    } else {
      return input;
    }
  }

  const handleSearch = () => {
    if (searchText.trim() !== "" && !invalidDomain) {
      const processedText = processString(searchText);
      setSearchText("");
      navigate(`/fetch-name-service/domain-details/${processedText}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);

    const errorMessage = validation(value);
    setInvalidDomain(!!errorMessage);
    setErrorMessage(errorMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <React.Fragment>
      <div className={style["searchContainer"]}>
        <input
          type="text"
          value={searchText}
          className={style["inputStyle"]}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Search a .FET name"
        />
        <button
          className={style["buttonStyle"]}
          onClick={handleSearch}
          disabled={searchText.trim() === "" || invalidDomain}
        >
          SEARCH
        </button>
      </div>
      {errorMessage && (
        <div className={style["invalidText"]}>{errorMessage}</div>
      )}
    </React.Fragment>
  );
};
