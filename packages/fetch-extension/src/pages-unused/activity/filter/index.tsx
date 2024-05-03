import React, { useState, useEffect, useRef } from "react";
import styles from "./style.module.scss";
import arrowIcon from "@assets/icon/right-arrow.png";
import { useStore } from "../../../stores";

export const FilterActivities: React.FC<{
  onFilterChange: (filter: string[]) => void;
  options: any[];
  selectedFilter: any[];
}> = ({ onFilterChange, options, selectedFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { analyticsStore } = useStore();
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
    analyticsStore.logEvent("activity_filter_click", {
      action: "unselectAll",
    });
  };

  const handleSelectClicks = () => {
    const allFilters = options.map((option) => option.value);
    if (selectedFilter.length != allFilters.length) onFilterChange(allFilters);
    analyticsStore.logEvent("activity_filter_click", {
      action: "selectAll",
    });
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles["dropdown"]}>
      <div className={styles["dropdownToggle"]} ref={dropdownRef}>
        <div className={styles["dropdownHeading"]} onClick={toggleDropdown}>
          <span>Filter</span>
          <img
            src={arrowIcon}
            alt="Arrow Icon"
            className={styles["arrowIcon"]}
          />
        </div>
        {isOpen && (
          <div className={styles["dropdownMenuPopup"]}>
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
          </div>
        )}
      </div>
    </div>
  );
};
