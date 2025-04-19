import React, { useEffect } from "react";
import Image from "next/image";
import { useState } from "react";
import axios from "axios";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";
import ChatLoading from "../component/ChatLoading.jsx";
import UserListItem from "../userInfo/UserListItem.jsx";
import { useChat } from "@/app/context/ChatContext";
import { Spinner } from "@/components/ui/Spinner.jsx";

const SearchDrawer = () => {
  const router = useRouter();
  const { selectedChat, setSelectedChat, chats, setChats, user, fetchChats } =
    useChat();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async (e) => {
    if (!search) {
      toast.error("Please Enter a Search Term", {
        action: { label: "X" },
      });
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("currentUser");
      if (!token) return;

      const { data } = await axios.get(
        `http://localhost:7700/api/user/searchUsers?search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Search results frontend:", data);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast.error("Error fetching search results", {
        action: { label: "X" },
      });
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const token = localStorage.getItem("currentUser");
      if (!token) {
        toast.error("Please login to continue");
        router.push("/login");
        return;
      }

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.post(
        "http://localhost:7700/api/chat/accessChat",
        { userId },
        config
      );

      // Check if chat already exists
      const existingChat = chats.find((chat) => chat._id === data._id);

      if (!existingChat) {
        // Add new chat to the beginning of the chats array
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      console.log("Chat", data);

      setLoadingChat(false);
      setIsOpen(false);
      toast.success("Chat created successfully");

      // Refresh the chats list
      await fetchChats();
    } catch (error) {
      console.error("Error accessing chat:", error);
      toast.error("Error creating chat. Please try again.");
      setLoadingChat(false);
    }
  };

  return (
    <div>
      <Drawer
        direction="left"
        open={isOpen}
        onOpenChange={setIsOpen}
        modal={false}
      >
        <DrawerTrigger asChild>
          <button
            className="flex items-center space-x-2 px-3 py-1.5 text-sm hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors border-2 border-black rounded-tr-2xl rounded shadow-[4px_4px_0px_0px_rgba(0,128,128,1)]"
            onClick={() => setIsOpen(true)}
          >
            <Image
              src="/images/icons/Search.svg"
              width={18}
              height={18}
              alt="Search icon"
              className="opacity-80"
            />
            <span className="text-gray-700 font-medium">Search Users</span>
          </button>
        </DrawerTrigger>

        <DrawerContent
          className="h-full top-0 left-0 w-[300px] rounded-none mt-0"
          onInteractOutside={() => setIsOpen(false)}
        >
          <DrawerHeader className="text-left ">
            <DrawerTitle className="border-b-2 w-fit border-teal-700 text-lg">
              Search Users
            </DrawerTitle>
            <DrawerDescription className="border-b-2 w-fit border-teal-700 mt-2 text-base text-black">
              Chat with other user.
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 flex">
            <input
              type="text"
              placeholder="Search by name or email"
              className="w-full p-2 rounded-md mr-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,128,128,1)]"
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(e);
                }
              }}
            />
            <button
              className="text-white border-2 border-black rounded-full p-4 shadow-[4px_4px_0px_0px_rgba(0,128,128,1)] hover:bg-teal-700"
              onClick={handleSearch}
            >
              <Image
                src="/images/icons/Search.svg"
                width={18}
                height={18}
                alt="Search icon"
              />
            </button>
          </div>
          {loading ? (
            <ChatLoading />
          ) : (
            <div className="overflow-y-auto  px-6 max-h-[calc(100vh-200px)]">
              {searchResult.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))}
            </div>
          )}
          {loadingChat && (
            <div className="flex justify-center items-center p-4">
              <Spinner size="small" />
            </div>
          )}

          <DrawerClose asChild>
            <button
              className="absolute top-4 right-4 p-1 rounded-sm opacity-70 hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default SearchDrawer;
