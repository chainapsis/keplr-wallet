import React from "react";
import styles from "./style.module.scss";

export interface CardProps {
  leftImage?: any;
  leftImageStyle?: React.CSSProperties;
  heading: any;
  subheading?: any;
  rightContent?: any;
  isActive?: boolean;
  style?: any;
  subheadingStyle?: any;
  headingStyle?: any;
  onClick?: any;
  rightContentOnClick?: any;
  rightContentStyle?: any;
  inActiveBackground?: any;
}

export const Card: React.FC<CardProps> = ({
  leftImage,
  leftImageStyle,
  heading,
  subheading,
  rightContent,
  rightContentStyle,
  isActive,
  style,
  subheadingStyle,
  headingStyle,
  onClick,
  rightContentOnClick,
  inActiveBackground,
}) => {
  const containerStyle: React.CSSProperties = {
    backgroundColor: isActive
      ? "var(--Indigo---Fetch, #5F38FB)"
      : inActiveBackground
      ? inActiveBackground
      : "rgba(255,255,255,0.1)",
    cursor: onClick || rightContentOnClick ? "pointer" : "default",
    ...style,
  };

  return (
    <div
      style={containerStyle}
      className={styles["cardContainer"]}
      onClick={onClick}
    >
      {leftImage &&
        (leftImage.length > 1 ? (
          <img
            src={leftImage.length > 1 && leftImage}
            alt={leftImage[0]}
            className={styles["leftImage"]}
            style={leftImageStyle}
          />
        ) : (
          <div className={styles["leftImage"]} style={leftImageStyle}>
            {leftImage}
          </div>
        ))}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div className={styles["middleSection"]}>
          <div
            style={{ ...headingStyle }}
            className={`${styles["heading"]} ${styles["wordBreak"]}`}
          >
            {heading}
          </div>
          {subheading && (
            <div
              className={styles["subHeading"]}
              style={{ ...subheadingStyle }}
            >
              {subheading}
            </div>
          )}
        </div>

        <div className={styles["rightSection"]}>
          {React.isValidElement(rightContent) ? (
            <div style={rightContentStyle}> {rightContent}</div>
          ) : rightContent && rightContent.includes("chrome-extension://") ? (
            <img
              onClick={rightContentOnClick}
              src={rightContent}
              alt="Right Section"
              className={styles["rightImage"]}
              style={rightContentStyle}
            />
          ) : (
            <div onClick={rightContentOnClick} className={styles["rightText"]}>
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
