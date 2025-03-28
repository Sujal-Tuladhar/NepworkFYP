import React from "react";
import Link from "next/link";
const NavBar = () => {
  return (
    <div className=" flex flex-wrap justify-between items-center px-7 py-4 md:px-10 border-b-2">
      <div className="logo text-[20px] md:text-[25px] font-bold border-t-[2px] border-l-[2px] border-r-[5px] border-b-[5px] border-black rounded-tr-3xl p-1">
        <Link href="/">
          <span className="">NepWork</span>
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/register"
          className="btn px-4 py-2 md:px-6 md:py-3 font-semibold bg-white text-black border-t-[2px] border-l-[2px] border-r-[4px] border-b-[4px] border-black rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Join Now
        </Link>

        <Link
          href="/login"
          className="btn px-4 py-2 md:px-6 md:py-3 font-semibold bg-white text-black border-t-[2px] border-l-[2px] border-r-[4px] border-b-[4px] border-black rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default NavBar;
