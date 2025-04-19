import React, { useState } from "react";
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
import axios from "axios";
import Image from "next/image";
import { useChat } from "@/app/context/ChatContext";
import { useAuth } from "@/app/context/AuthContext";
import UserBadgeItem from "../userInfo/UserBadgeItem.jsx";
import { Spinner } from "@/components/ui/Spinner";
import UserListItem from "../userInfo/UserListItem";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const [open, setOpen] = useState(false);
  const { selectedChat, setSelectedChat } = useChat();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [renameLoading, setRenameLoading] = useState(false);

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast.error("Only admins can remove users");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("currentUser");
      if (!token) return;
      const { data } = await axios.put(
        `http://localhost:7700/api/chat/remove-group`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      user1._id === user._id ? setSelectedChat("") : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
      toast.success("User removed successfully");
    } catch (error) {
      setLoading(false);
      toast.error("Error removing user");
    }
  };

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
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
      toast.success("Group Renamed Successfully");
    } catch (error) {
      setRenameLoading(false);
      toast.error("Error Renaming Group");
    }
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("currentUser");
      if (!token) return;
      const { data } = await axios.get(
        `http://localhost:7700/api/user/searchUsers?search=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSearchResult(data);
    } catch (error) {
      toast.error("Error fetching search results");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast.error("User already in the group");
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toast.error("Only admins can add users");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("currentUser");
      if (!token) return;

      const { data } = await axios.put(
        `http://localhost:7700/api/chat/group-add`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
      toast.success("User added successfully");
    } catch (error) {
      setLoading(false);
      toast.error("Error adding user");
    }
  };

  return (
    <div>
      <Toaster richColors position="top-right" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="flex p-1 hover:bg-gray-100 rounded">
            <Image
              src="/images/icons/View.svg"
              alt="view"
              width={20}
              height={20}
            />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedChat?.chatName}</DialogTitle>
          </DialogHeader>
          <div className="w-[100%] flex flex-wrap pb-3 gap-1">
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 flex-1"
              onChange={(e) => setGroupChatName(e.target.value)}
            />
            <button
              className="border-2 p-2 border-black rounded-tr-2xl hover:bg-blue-300 shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] ml-4"
              onClick={handleRename}
              disabled={renameLoading}
            >
              {renameLoading ? <Spinner size="small" /> : "Rename"}
            </button>
          </div>
          <div className="flex">
            <input
              id="searchuser"
              type="text"
              placeholder="Add Users"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mb-1 w-full"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Search results container with limited height and scroll */}
          <div className="max-h-[213px] overflow-y-auto mb-4">
            {loading ? (
              <div className="flex justify-center">
                <Spinner />
              </div>
            ) : (
              searchResult?.slice(0, 5).map(
                (
                  user // Limit to 5 results
                ) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleAddUser(user)}
                  />
                )
              )
            )}
          </div>

          <DialogFooter>
            <button
              className="border-2 p-2 border-black rounded-tr-2xl hover:bg-red-300 shadow-[4px_4px_0px_0px_rgba(255,99,132,0.5)]"
              type="button"
              onClick={() => handleRemove(user)}
              disabled={loading}
            >
              {loading ? <Spinner size="small" /> : "Leave Group"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateGroupChatModal;
