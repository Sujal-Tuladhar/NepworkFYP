import React, { useState } from "react";
import Image from "next/image";
import SearchDrawer from "./component/SearchDrawer";
import { Search } from "lucide-react";

const SideDrawer = () => {
 

  return (
    <div className="w-full bg-white border-b border-gray-200 py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* User button on the left */}
        <SearchDrawer />
        {/* Centered Messages title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h2 className="text-lg font-medium text-gray-800">Messages</h2>
        </div>
      </div>
      {/* Drawer component */}
    </div>
  );
};

export default SideDrawer;
