import React from "react";
import Image from "next/image";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <div
      onClick={handleFunction}
      className="flex items-center gap-2 mb-2 p-2 hover:bg-gray-100 cursor-pointer border-2 rounded-tr-2xl rounded-bl-2xl border-black shadow-[4px_4px_0px_0px_rgba(0,128,128,1)]"
    >
      <div className="w-10 h-10 rounded-full overflow-hidden relative">
        <Image
          src={
            user.profilePic ||
            "https://res.cloudinary.com/dx6rq6eiw/image/upload/v1743739212/awkzeed1w7yq31wmjtgs.jpg"
          }
          alt="username"
          fill
          sizes="(max-width: 40px) 40px, 40px"
          className="object-cover"
          priority
        />
      </div>
      <div>
        <h3 className="font-medium">{user.username}</h3>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
    </div>
  );
};

export default UserListItem;
