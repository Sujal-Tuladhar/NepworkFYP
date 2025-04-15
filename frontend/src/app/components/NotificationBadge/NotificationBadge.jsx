import React from "react";
import Image from "next/image";

const NotificationBadge = ({ notification = [] }) => {
  return (
    <div className="relative w-fit">
      <Image
        src="/images/Navbar/Notification.svg"
        width={24}
        height={24}
        alt="notification"
      />
      {notification.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          {notification.length}
        </span>
      )}
    </div>
  );
};

export default NotificationBadge;
