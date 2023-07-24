import React from "react";
import loadingChatGif from "@assets/chat-loading.gif";

export const ChatLoader = ({ message }: { message: string }) => {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "110px 0px",
      }}
    >
      <img draggable={false} src={loadingChatGif} width={100} />
      <br />
      {message}
    </div>
  );
};
