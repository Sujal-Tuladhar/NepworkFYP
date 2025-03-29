"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("currentUser");
    if (!token) {
      router.push("/login"); // Redirect to login if no token found
    }
  }, []);

  return <div>Dashboard</div>;
};

export default Dashboard;
