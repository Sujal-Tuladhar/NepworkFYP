"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { io } from "socket.io-client";

const ENDPOINT = "http://localhost:7700";
let socket;

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

  useEffect(() => {
    // Initialize socket connection
    socket = io(ENDPOINT);

    // Setup socket events
    socket.emit("setup", user);
    socket.on("connected", () => {
      console.log("Socket connected");
    });

    // Handle message received event
    socket.on("message received", (newMessage) => {
      // Check if the message is from the currently selected chat
      if (selectedChat && selectedChat._id === newMessage.chat._id) {
        // If in the same chat, update messages directly
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat._id === newMessage.chat._id) {
              return {
                ...chat,
                latestMessage: newMessage,
              };
            }
            return chat;
          });
        });
      } else {
        // If not in the same chat, add to notifications
        setNotification((prevNotifications) => {
          // Check if notification already exists
          const exists = prevNotifications.some(
            (notif) => notif._id === newMessage._id
          );
          if (!exists) {
            return [newMessage, ...prevNotifications];
          }
          return prevNotifications;
        });
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off("message received");
      socket.off("connected");
      socket.disconnect();
    };
  }, [user, selectedChat]);

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
