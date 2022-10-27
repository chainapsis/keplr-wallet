import React from "react";
import loadingChatGif from "../../public/assets/chat-loading.gif";

export const ChatLoader = ({ message }: { message: string }) => {
  return (
    <div
      style={{
        textAlign: "center",
        margin: "140px 0px",
      }}
    >
      <img src={loadingChatGif} width={100} />
      <br />
      {message}
    </div>
  );
};
