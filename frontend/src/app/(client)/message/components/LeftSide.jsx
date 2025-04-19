import React from "react";
import { useChat } from "@/app/context/ChatContext.jsx";
import { Toaster, toast } from "sonner";
import { useEffect, useState } from "react";
import axios from "axios";
import ChatLoading from "./component/ChatLoading";
import { getSender, getSenderFull } from "../config/ChatLogics.js";
import GroupChatModal from "./component/GroupChatModal.jsx";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";

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
      } md:flex flex-col items-center p-3 bg-white w-full md:w-[31%] rounded rounded-tr-4xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,128,128,1)] h-[77vh]`}
    >
      <Toaster richColors position="top-right" />

      <div className="flex w-full justify-between items-center px-3 pb-3 text-[28px] md:text-[30px] font-sans font-semibold">
        <span className="border-b-2 border-black shadow-[0_4px_0_0_#0f766e]">
          My Chats
        </span>
        <GroupChatModal chats={chats} setChats={setChats}>
          <button className="border-2 border-black px-3 py-1 text-sm hover:bg-gray-100 transition-colors rounded rounded-tr-xl shadow-[4px_4px_0px_0px_rgba(0,128,128,1)]">
            <div className="flex gap-2 ">
              <Image
                src="/images/icons/Plus.svg"
                alt="add-user"
                width={20}
                height={20}
              />
              Create Group
            </div>
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
                className={`cursor-pointer  px-3 py-2 rounded border-2 border-black rounded-bl-2xl rounded-tr-2xl mb-2 ${
                  selectedChat === chat
                    ? "bg-teal-700 text-white"
                    : " text-black"
                }`}
              >
                <div className="flex items-center gap-2 ">
                  {!chat.isGroupChat ? (
                    <>
                      <div className="w-10 h-10 rounded-full overflow-hidden relative">
                        <Image
                          src={
                            getSenderFull(user, chat.users)?.profilePic ||
                            "https://res.cloudinary.com/dx6rq6eiw/image/upload/v1743739212/awkzeed1w7yq31wmjtgs.jpg"
                          }
                          alt="profile"
                          fill
                          sizes="(max-width: 40px) 40px, 40px"
                          className="object-cover"
                          priority
                        />
                      </div>
                      <h1>{getSender(user, chat.users)}</h1>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full overflow-hidden relative ">
                        <Image
                          src="/images/icons/NoAvatar.svg"
                          alt="group chat"
                          fill
                          sizes="(max-width: 40px) 40px, 40px"
                          className="object-cover"
                          priority
                        />
                      </div>
                      <h1>Group: {chat.chatName}</h1>
                    </>
                  )}
                </div>
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
