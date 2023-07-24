import { updateMessageFeedback } from "@utils/auth";
import React, { useEffect, useState } from "react";

export const MessageFeedBack = ({
  messageId,
  chainId,
  targetAddress,
}: {
  messageId: string;
  chainId: string;
  targetAddress: string;
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setIsDisliked(false);
    localStorage.setItem(
      messageId,
      JSON.stringify({ isLiked: !isLiked, isDisliked: false })
    );
    updateMessageFeedback(messageId, chainId, !isLiked ? 0 : 1, targetAddress);
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    setIsLiked(false);
    localStorage.setItem(
      messageId,
      JSON.stringify({ isDisliked: !isDisliked, isLiked: false })
    );
    updateMessageFeedback(
      messageId,
      chainId,
      !isDisliked ? 1 : 0,
      targetAddress
    );
  };

  useEffect(() => {
    if (messageId) {
      const status = localStorage.getItem(messageId);
      if (status) {
        const statusValues = JSON.parse(status);
        setIsDisliked(statusValues.isDisliked);
        setIsLiked(statusValues.isLiked);
      }
    }
  }, [messageId]);

  return (
    <div style={{ alignItems: "center", fontStyle: "italic" }}>
      Was this reply helpful?{"  "}
      {!isDisliked && (
        <i
          className={`fas fa-thumbs-up fa-2xs`}
          onClick={handleLike}
          style={{
            cursor: "pointer",
            padding: "0px 2px",
            color: isLiked ? "green" : "gray",
          }}
        />
      )}
      {!isLiked && (
        <i
          className={`fa fa-thumbs-down fa-2xs`}
          onClick={handleDislike}
          style={{
            cursor: "pointer",
            padding: "0px 2px",
            color: isDisliked ? "red" : "gray",
          }}
        />
      )}
    </div>
  );
};
