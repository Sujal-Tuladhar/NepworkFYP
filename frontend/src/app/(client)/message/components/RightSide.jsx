import { useChat } from "@/app/context/ChatContext";
import React from "react";
import SingleChat from "../components/SingleChat.jsx";

function RightSide({ fetchAgain, setFetchAgain }) {
  const { selectedChat } = useChat();

  return (
    <div
      className={`${
        selectedChat ? "flex" : "hidden"
      } md:flex flex-col items-center p-3 bg-white w-full h-full md:w-[68%] rounded-lg border`}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </div>
  );
}

export default RightSide;
