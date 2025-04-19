"use client";
import React, { useEffect, useState } from "react";
import LeftSide from "./components/LeftSide";
import RightSide from "./components/RightSide";
import SideDrawer from "./components/SideDrawer";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

function Page() {
  const { isLoggedIn, loading } = useAuth();
  const [fetchAgain, setFetchAgain] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Disable scrolling when component mounts
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

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
        <div className="overflow-hidden">
          {" "}
          {/* Added overflow-hidden */}
          <SideDrawer />
          <div className="flex justify-between w-[100%] h-[81vh] p-2.5 overflow-hidden">
            {" "}
            {/* Added overflow-hidden */}
            <LeftSide fetchAgain={fetchAgain} />
            <RightSide fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          </div>
        </div>
      )}
    </>
  );
}

export default Page;