"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import LeftSide from "./components/LeftSide";
import RightSide from "./components/RightSide";
import newRequest from "@/app/utils/newRequest.js";

function Page() {
  const [chats, setChats] = useState([]);

  const fetchChat = async () => {
    try {
      const res = await axios.get("http://localhost:7700/api/chat");
      const data = res.data;
      setChats(data);
    } catch (error) {
      console.error("Error fetching chat data:", error);
    }
  };

  useEffect(() => {
    fetchChat();
  }, []);

  return (
    <div>
      Chat Page
      {chats.map((chat) => (
        <div key={chat._id}>
          <h1>{chat.chatName}</h1>
        </div>
      ))}
      <LeftSide />
      <RightSide />
    </div>
  );
}

export default Page;
