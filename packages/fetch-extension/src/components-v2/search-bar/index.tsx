import React, { useState, useEffect } from "react";
import style from "./style.module.scss";
import { Card } from "@components-v2/card";
import { _DeepReadonlyArray } from "utility-types/dist/mapped-types";
import { AddressBookData } from "@keplr-wallet/hooks";

interface Props {
  searchTerm: string;
  valuesArray: any[] | _DeepReadonlyArray<AddressBookData>;
  renderResult: (value: any, index: number) => React.ReactNode;
  onSearchTermChange: (term: string) => void;
  itemsStyleProp?: any;
  filterFunction: any;
}

export const SearchBar: React.FC<Props> = ({
  searchTerm,
  valuesArray,
  renderResult,
  onSearchTermChange,
  itemsStyleProp,
  filterFunction,
}) => {
  const [suggestedValues, setSuggestedValues] = useState<
    any[] | _DeepReadonlyArray<AddressBookData>
  >([]);

  useEffect(() => {
    const searchTermLower = searchTerm.toLowerCase();

    if (searchTermLower === "") {
      setSuggestedValues(valuesArray);
    } else {
      const filteredValues = filterFunction(valuesArray, searchTermLower);
      setSuggestedValues(filteredValues);
    }
  }, [searchTerm, valuesArray]);

  return (
    <div>
      <Card
        style={{
          background: "rgba(255,255,255,0.1)",
          marginBottom: "24px",
          padding: "12px 18px",
        }}
        heading={
          <input
            className={style["searchInput"]}
            type="text"
            id="searchInput"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        }
        rightContent={require("@assets/svg/wireframe/search.svg")}
      />

      {suggestedValues.length > 0 && (
        <div style={itemsStyleProp}>
          {suggestedValues.map((value, index) => (
            <div key={index}>{renderResult(value, index)}</div>
          ))}
        </div>
      )}
    </div>
  );
};
