import React from "react";
import ScrollableFeed from "./ScrollableFeed";
import { isSameSender, isLastMessage } from "../../config/ChatLogics";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";

const ScrollableChat = ({ messages }) => {
  const { user } = useAuth();

  if (!Array.isArray(messages)) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No messages available
      </div>
    );
  }

  return (
    <ScrollableFeed>
      {messages.map((m, i) => {
        const isCurrentUser = m.sender._id === user?._id;
        const showSender =
          isSameSender(messages, m, i, user?._id) ||
          isLastMessage(messages, i, user?._id);

        return (
          <div
            key={m._id}
            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[85%] ${isCurrentUser ? "ml-4" : "mr-4"}`}>
              {showSender && !isCurrentUser && (
                <div className="flex items-center mb-1 gap-2">
                  <div className="w-6 h-6 rounded-full  overflow-hidden">
                    <Image
                      src={m.sender.profilePic || "/default-avatar.png"}
                      alt={m.sender.username}
                      width={28}
                      height={28}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[14px] font-medium text-gray-600">
                    {m.sender.username}
                  </span>
                </div>
              )}
              <div className="ml-6">
                <div
                  className={`rounded-lg px-3 py-1.5 transition-all duration-200  ${
                    isCurrentUser
                      ? "bg-teal-600 text-white rounded-br-none hover:bg-teal-700"
                      : "bg-gray-200 text-gray-800 rounded-bl-none hover:bg-gray-300 "
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {m.content}
                  </p>
                </div>
                <div
                  className={`text-[11px] mt-1 text-right ${
                    isCurrentUser ? "text-black" : "text-black"
                  }`}
                >
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
