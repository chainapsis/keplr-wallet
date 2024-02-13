import React, { useState } from "react";
import style from "./style.module.scss";
import { useNavigate } from "react-router-dom";
import searchButton from "@assets/icon/search.png";
import arrowIcon from "@assets/icon/send-token.png";
import { useStore } from "../../../stores";

export const SearchInput = () => {
  const navigate = useNavigate();
  const { analyticsStore } = useStore();
  const [searchText, setSearchText] = useState("");
  const [invalidDomain, setInvalidDomain] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validation = (string: string) => {
    const invalidCharacters = ["#", "$", "%", "/", "|", "\\", ":", ";", "."];
    if (string.split("").some((char) => invalidCharacters.includes(char))) {
      return "Invalid special characters";
    }
    if (string.length > 64) return "Character limit exceeded (Max : 64 chars)";
    if (string.length > 0 && string.length < 3)
      return "Domain name is too short";
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
    analyticsStore.logEvent("fns_register_button_click");
    if (
      searchText.trim() !== "" &&
      searchText.trim().length > 2 &&
      !invalidDomain
    ) {
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
          maxLength={64}
          value={searchText}
          className={style["searchInput"]}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Search a .FET name"
        />
        <img src={searchButton} className={style["searchIcon"]} alt="" />
      </div>
      {errorMessage && (
        <div className={style["invalidText"]}>{errorMessage}</div>
      )}

      <button
        className={style["registerButton"]}
        onClick={handleSearch}
        disabled={
          searchText.trim() === "" ||
          searchText.trim().length < 3 ||
          invalidDomain
        }
      >
        Register{" "}
        <img src={arrowIcon} className={style["registerIcon"]} alt="" />
      </button>
    </React.Fragment>
  );
};
