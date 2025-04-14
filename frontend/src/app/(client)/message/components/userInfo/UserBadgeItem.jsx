import React from "react";

const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <div
      className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-1 mb-1 cursor-pointer hover:bg-blue-200 transition-colors"
      onClick={handleFunction}
    >
      {user?.name || user?.username}
      <span className="ml-1 text-blue-800 hover:text-blue-900 font-bold">
        ×
      </span>
    </div>
  );
};

export default UserBadgeItem;
