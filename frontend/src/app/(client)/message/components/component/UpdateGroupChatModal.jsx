import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useChat } from "@/app/context/ChatContext";
import UserBadgeItem from "../userInfo/UserBadgeItem.jsx";
import {} from "../../config/ChatLogics.js";
import { set } from "react-hook-form";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain }) => {
  const [open, setOpen] = useState(false);
  const { selectedChat, setSelectedChat, user } = useChat();
  const [loading, setLoading] = useState(false);
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchedResult, setSearchedResult] = useState([]);
  const [renameLoading, setRenameLoading] = useState(false);

  const handleRemove = (userToRemove) => {};

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);
      const token = localStorage.getItem("currentUser");
      if (!token) return;

      const { data } = await axios.put(
        `http://localhost:7700/api/chat/rename-group`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSelectedChat(data);
      console.log(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
      toast.success("Group Renamed Successfully");
    } catch (error) {
      setRenameLoading(false);
      toast.error("Error Renaming Group");
    }
  };

  const handleSearch = async (query) => {};

  return (
    <div>
      <Toaster richColors position="top-right" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="flex">
            <Image
              src="/images/icons/View.svg"
              alt="view"
              width={20}
              height={20}
            />{" "}
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedChat?.chatName}</DialogTitle>
          </DialogHeader>
          <div className="w-[100%] flex flex-wrap pb-3 ">
            {selectedChat.users.map((u) => (
              <UserBadgeItem
                key={u._id}
                user={u}
                admin={selectedChat.groupAdmin}
                handleFunction={() => handleRemove(u)}
              />
            ))}
          </div>
          <div className="flex mb-2">
            <input
              id="chatname"
              type="text"
              placeholder="Chat Name"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              onChange={(e) => setGroupChatName(e.target.value)}
            />
            <button
              className="  border-2 p-2 border-black rounded-tr-2xl hover:bg-blue-300 shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] ml-4"
              onClick={handleRename}
            >
              Rename
            </button>
          </div>
          <div className="flex ">
            <input
              id="chatname"
              type="text"
              placeholder="Add Users"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mb-1"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <DialogFooter>
            <button
              className="border-2 p-2 border-black rounded-tr-2xl hover:bg-red-300 shadow-[4px_4px_0px_0px_rgba(255,99,132,0.5)]"
              type="button"
              onClick={handleRemove(user)}
            >
              Leave Group
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateGroupChatModal;
