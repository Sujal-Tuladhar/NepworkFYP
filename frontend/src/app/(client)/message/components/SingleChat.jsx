import React from "react";
import { useChat } from "@/app/context/ChatContext";
import Image from "next/image";
import { getSender } from "../config/ChatLogics.js";
import UpdateGroupChatModal from "./component/UpdateGroupChatModal.jsx";

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat } = useChat();

  return (
    <div className="w-full h-full">
      {selectedChat ? (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between w-full pb-3 px-2">
            <div className="flex items-center w-full">
              {/* Back Arrow for mobile */}
              <button
                className="md:hidden mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setSelectedChat("")}
                aria-label="Back to chats"
              >
                <Image
                  src="/images/icons/BackArrow.svg"
                  alt="Back Arrow"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </button>

              {/* Chat title - centered */}
              <h2 className="flex-1 text-center text-xl md:text-2xl font-semibold text-gray-800 truncate">
                {!selectedChat.isGroupChat ? (
                  getSender(user, selectedChat?.users)
                ) : (
                  <>{selectedChat.chatName.toUpperCase()}</>
                )}
              </h2>

              {/* Group chat modal trigger */}
              {selectedChat.isGroupChat && (
                <div className="ml-2">
                  <UpdateGroupChatModal
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </div>
              )}

              {/* Empty spacer for alignment */}
              <div className="md:hidden w-9"></div>
            </div>
          </div>

          {/* Chat messages container */}
          <div className="flex-1 bg-gray-100 rounded-lg p-4 overflow-y-auto">
            {/* Chat messages will go here */}
            <div className="h-full flex items-center justify-center text-gray-500">
              {selectedChat.isGroupChat ? (
                <p>Group chat messages will appear here</p>
              ) : (
                <p>Your private messages will appear here</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-xl md:text-2xl text-center text-gray-500">
            Click on a user to start chatting
          </p>
        </div>
      )}
    </div>
  );
};

export default SingleChat;
