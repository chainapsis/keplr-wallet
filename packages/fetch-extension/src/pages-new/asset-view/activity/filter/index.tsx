import React, { useState, useRef } from "react";
import styles from "./style.module.scss";
import { Dropdown } from "@components-v2/dropdown";

export const FilterActivities: React.FC<{
  onFilterChange: (filter: string[]) => void;
  options: any[];
  selectedFilter: any[];
}> = ({ onFilterChange, options, selectedFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const handleCheckboxChange = (value: string) => {
    const newFilters = selectedFilter;
    if (newFilters.includes(value)) {
      onFilterChange(newFilters.filter((item) => item !== value));
    } else {
      onFilterChange([...newFilters, value]);
    }
  };

  const handleDeselectClicks = () => {
    if (selectedFilter.length != 0) onFilterChange([]);
  };

  const handleSelectClicks = () => {
    const allFilters = options.map((option) => option.value);
    if (selectedFilter.length != allFilters.length) onFilterChange(allFilters);
  };

  return (
    <div className={styles["dropdown"]}>
      <div> Activity </div>
      <div className={styles["dropdownToggle"]} ref={dropdownRef}>
        <div className={styles["dropdownHeading"]} onClick={toggleDropdown}>
          Filter
          <img
            src={require("@assets/svg/wireframe/filter.svg")}
            alt="filter"
            className={styles["arrowIcon"]}
          />
        </div>
      </div>
      <Dropdown
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={"Filter"}
        closeClicked={() => {
          setIsOpen(false);
        }}
      >
        <div className={styles["select"]}>
          <div onClick={handleSelectClicks}>Select all</div>
          <div onClick={handleDeselectClicks}>Unselect all</div>
        </div>
        <div className={styles["dropdownMenu"]}>
          {options.map((option) => (
            <label key={option.value} className={styles["dropdownItem"]}>
              <input
                type="checkbox"
                className="mx-2"
                value={option.value}
                checked={selectedFilter.includes(option.value)}
                onChange={() => handleCheckboxChange(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </Dropdown>
    </div>
  );
};
