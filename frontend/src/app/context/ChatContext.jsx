"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);
  const router = useRouter();

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
      console.error("Error fetching chats:", error);
    }
  };

  useEffect(() => {
    const userInfo = localStorage.getItem("currentUser");
    if (!userInfo) {
      router.push("/login");
    } else {
      setUser(userInfo);
      fetchChats();
    }
  }, [router]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        fetchChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
