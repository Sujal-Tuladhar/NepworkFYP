import React from "react";
import { useChat } from "@/app/context/ChatContext.jsx";
import { Toaster, toast } from "sonner";
import { useEffect, useState } from "react";
import axios from "axios";
import ChatLoading from "./component/ChatLoading";
import { getSender } from "../config/ChatLogics.js";
import GroupChatModal from "./component/GroupChatModal.jsx";
import { useAuth } from "@/app/context/AuthContext";

function LeftSide({ fetchAgain }) {
  const { user } = useAuth();

  const { selectedChat, setSelectedChat, chats, setChats } = useChat();

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("currentUser");
      if (!token) return;

      const { data } = await axios.get(
        "http://localhost:7700/api/chat/fetchChat",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setChats(data);
    } catch (error) {
      toast.error("Error fetching chats", {
        action: { label: "X" },
      });
    }
  };
  useEffect(() => {
    fetchChats();
  }, [fetchAgain]);

  return (
    <div
      className={`${
        selectedChat ? "hidden" : "flex"
      } md:flex flex-col items-center p-3 bg-white w-full md:w-[31%] rounded-lg border`}
    >
      <Toaster richColors position="top-right" />

      <div className="flex w-full justify-between items-center px-3 pb-3 text-[28px] md:text-[30px] font-sans font-semibold">
        <span>My Chats</span>
        <GroupChatModal chats={chats} setChats={setChats}>
          <button className="border-2 border-black px-3 py-1 text-sm hover:bg-gray-100 transition-colors">
            Create Group
          </button>
        </GroupChatModal>
      </div>
      <div className="flex flex-col p-3 w-[100%] h-[100%] overflow-y-hidden rounded-lg">
        {chats ? (
          <div className="overflow-y-scroll">
            {chats.map((chat) => (
              <div
                onClick={() => setSelectedChat(chat)}
                key={chat._id}
                className={`cursor-pointer px-3 py-2 rounded-lg mb-2 ${
                  selectedChat === chat
                    ? "bg-teal-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                <h1 className="">
                  {!chat.isGroupChat
                    ? getSender(user, chat.users)
                    : chat.chatName}
                </h1>
              </div>
            ))}
          </div>
        ) : (
          <ChatLoading />
        )}
      </div>
    </div>
  );
}

export default LeftSide;
