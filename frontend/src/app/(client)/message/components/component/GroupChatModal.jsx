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
import UserListItem from "../userInfo/UserListItem";
import UserBadgeItem from "../userInfo/UserBadgeItem.jsx";

const GroupChatModal = ({ children, chats, setChats }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [open, setOpen] = useState(false);

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

  const handleGroup = (userToAdd) => {
    if (selectedUsers.some((u) => u._id === userToAdd._id)) {
      toast.error("User already in the group");
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupChatName || selectedUsers.length < 1) {
      toast.error("Please enter a group name and select at least one member.");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("currentUser");
      if (!token) return;

      const { data } = await axios.post(
        "http://localhost:7700/api/chat/create-group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!data) {
        throw new Error("No data returned from API");
      }

      setChats(Array.isArray(chats) ? [data, ...chats] : [data]);
      setSelectedUsers([]);
      setGroupChatName("");
      setOpen(false);
      toast.success("Group chat created successfully");
    } catch (error) {
      console.error("Error creating group chat:", error);
      toast.error("Error creating group chat");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (userToDelete) => {
    setSelectedUsers(
      selectedUsers.filter((user) => user._id !== userToDelete._id)
    );
  };

  return (
    <div>
      <Toaster richColors position="top-right" />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <span className="cursor-pointer">{children}</span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-white border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold border-b-2 border-black pb-2">
              Create Group Chat
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="groupName"
                className="text-sm font-medium text-gray-700"
              >
                Group Name
              </label>
              <input
                id="groupName"
                type="text"
                placeholder="Enter the group name"
                className="px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label
                htmlFor="addUsers"
                className="text-sm font-medium text-gray-700"
              >
                Add Users
              </label>
              <input
                id="addUsers"
                type="text"
                placeholder="Search users..."
                className="px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                onChange={(e) => handleSearch(e.target.value)}
              />

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border-2 border-black rounded-lg">
                  {selectedUsers.map((u) => (
                    <UserBadgeItem
                      key={u._id}
                      user={u}
                      handleFunction={() => handleDelete(u)}
                    />
                  ))}
                </div>
              )}

              {/* Search Results */}
              <div className="max-h-60 overflow-y-auto border-2 border-black rounded-lg p-2">
                {loading ? (
                  <div className="flex justify-center items-center h-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
                  </div>
                ) : (
                  searchResult
                    ?.slice(0, 4)
                    .map((user) => (
                      <UserListItem
                        key={user._id}
                        user={user}
                        handleFunction={() => handleGroup(user)}
                      />
                    ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              className="px-4 py-2 border-2 border-black rounded-lg rounded-br-3xl hover:bg-blue-400 shadow-[4px_4px_0px_0px_rgba(65,105,225,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(65,105,225,1)] transition-all disabled:opacity-50"
              type="button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Group"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupChatModal;
