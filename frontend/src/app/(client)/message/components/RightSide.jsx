import { useChat } from "@/app/context/ChatContext";
import React from "react";
import SingleChat from "../components/SingleChat.jsx";

function RightSide({ fetchAgain, setFetchAgain }) {
  const { selectedChat } = useChat();

  return (
    <div
      className={`${
        selectedChat ? "flex" : "hidden"
      } md:flex flex-col items-center p-3 bg-white w-full  md:w-[68%] h-[77vh] rounded border-2 rounded-bl-3xl border-black shadow-[-4px_4px_0px_0px_rgba(0,128,128,1)]
`}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </div>
  );
}

export default RightSide;
