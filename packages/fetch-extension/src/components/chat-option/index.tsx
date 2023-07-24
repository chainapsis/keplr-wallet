import React from "react";

export const ChatOption = ({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) => {
  return (
    <div onClick={() => onClick()}>
      <h6>{title}</h6>
    </div>
  );
};
