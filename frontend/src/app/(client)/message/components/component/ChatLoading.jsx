import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ChatLoading = () => {
  return (
    <div className="px-6 ">
      <Skeleton className=" h-[45px] mb-2" />
      <Skeleton className=" h-[45px] mb-2 " />
      <Skeleton className=" h-[45px] mb-2" />
      <Skeleton className=" h-[45px] mb-2" />
      <Skeleton className=" h-[45px] mb-2" />
      <Skeleton className=" h-[45px] mb-2" />
      <Skeleton className=" h-[45px] mb-2" />
      <Skeleton className=" h-[45px] mb-2" />
      <Skeleton className=" h-[45px] mb-2" />
      <Skeleton className=" h-[45px] mb-2" />
      <Skeleton className=" h-[45px] mb-2" />
      <Skeleton className=" h- mb-2" />
    </div>
  );
};

export default ChatLoading;
