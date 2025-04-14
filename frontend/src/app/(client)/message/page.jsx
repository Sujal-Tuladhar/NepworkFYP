"use client";
import React, { useEffect, useState } from "react";
import LeftSide from "./components/LeftSide";
import RightSide from "./components/RightSide";
import SideDrawer from "./components/SideDrawer";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

function Page() {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      {isLoggedIn && (
        <div>
          <SideDrawer />
          <div className="flex justify-between w-[100%] h-[91vh] p-2.5">
            <LeftSide />
            <RightSide />
          </div>
        </div>
      )}
    </>
  );
}

export default Page;
