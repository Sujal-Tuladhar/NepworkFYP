import React from "react";
import Image from "next/image";
import Link from "next/link";
const Featured = () => {
  return (
    <div className="h-[500px] bg-white flex justify-center border-t border-black ">
      <div className="container w-[1400px] flex items-center">
        <div className="flex flex-col gap-8">
          <h1 className="text-[40px] bold">
            This is a world class Freelancing Site.
          </h1>
          <div className="flex items-center justify-between bg-white border-t-[4px] border-l-[4px] border-r-[8px] border-b-[8px] border-black rounded-tr-3xl px-2 py-1 max-w-md">
            <Image
              src="/images/icons/Search.svg"
              alt="search"
              width={20}
              height={20}
              className="mx-2"
            />
            <Link href="/gigs" className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search for jobs"
                className="flex items-center gap-2 border-none outline-none"
              />

              <button className="w-32 h-12 rounded-full bg-[#A7c5FA] border-none cursor-pointer">
                Search
              </button>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <h3>Popular:</h3>
            <Link href="/gigs">
              <button className="bg-transparent border-[2px] border-black rounded-xl p-2 text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] cursor-pointer ">
                Graphic and Design
              </button>
            </Link>
            <Link href="/gigs">
              <button className="bg-transparent border-[2px] border-black rounded-xl p-2 text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] cursor-pointer">
                Digital Marketing
              </button>
            </Link>
            <Link href="/gigs">
              <button className="bg-transparent border-[2px] border-black rounded-xl p-2 text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] cursor-pointer">
                Video and Animation
              </button>
            </Link>
            <Link href="/gigs">
              <button className="bg-transparent border-[2px] border-black rounded-xl p-2 text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] cursor-pointer">
                Programming and Tech
              </button>
            </Link>
            <Link href="/gigs">
              <button className="bg-transparent border-[2px] border-black rounded-xl p-2 text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] cursor-pointer">
                Music and Audio
              </button>
            </Link>
          </div>
        </div>

        <div className="h-[100%] p-10 w-[50%] ">
          <Image
            className=" object-contain rounded-3xl"
            src="/images/landing/Front.png"
            alt=""
            width={600}
            height={600}
          />
        </div>
      </div>
    </div>
  );
};

export default Featured;
