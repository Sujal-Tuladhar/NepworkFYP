import React, { useEffect } from "react";
import { useChat } from "@/app/context/ChatContext";
import Image from "next/image";
import { getSender } from "../config/ChatLogics.js";
import UpdateGroupChatModal from "./component/UpdateGroupChatModal.jsx";
import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner.jsx";
import { Toaster, toast } from "sonner";
import axios from "axios";
import "./style.css";
import ScrollableChat from "./component/ScrollableChat.jsx";

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat } = useChat();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const token = localStorage.getItem("currentUser");
      if (!token) return;

      setLoading(true);

      const { data } = await axios.get(
        `http://localhost:7700/api/message/allMessage/${selectedChat._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages(data);
      setLoading(false);
      console.log("Messages fetched abc:", data);
    } catch (error) {
      toast.error("Error fetching messages", {
        action: { label: "X" },
      });
    }
  };
  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      try {
        const token = localStorage.getItem("currentUser");
        if (!token) return;
        console.log(token);
        setNewMessage("");
        const { data } = await axios.post(
          "http://localhost:7700/api/message/sendMessage",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Message sent:", data);
        setMessages([...messages, data]);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const typingHandler = async (e) => {
    setNewMessage(e.target.value);
    // Typing INdicator Logic
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  return (
    <div className="w-full h-full flex flex-col">
      <Toaster position="top-center" richColors />
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
                    fetchMessages={fetchMessages}
                  />
                </div>
              )}

              {/* Empty spacer for alignment */}
              <div className="md:hidden w-9"></div>
            </div>
          </div>

          {/* Chat messages container - flex-1 to take remaining space */}
          <div className="flex-1 bg-gray-100 rounded-lg p-4 overflow-y-auto">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Spinner size="large" />
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* Messages will go here */}
                <div className=" message flex-1 flex items-center justify-center text-gray-500">
                  <ScrollableChat messages={messages} />
                </div>
              </div>
            )}
          </div>

          {/* Input field container - fixed at bottom */}
          <div className="p-4 bg-white border-t">
            <div onKeyDown={sendMessage}>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
                placeholder="Type your message..."
                onChange={typingHandler}
                value={newMessage}
                required
              />
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
