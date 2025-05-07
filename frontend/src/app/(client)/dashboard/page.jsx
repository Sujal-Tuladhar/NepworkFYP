"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const Dashboard = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [user, setUser] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [userGigs, setUserGigs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
  });
  const [selectedGig, setSelectedGig] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    shortDesc: "",
    description: "",
    price: "",
    delivery: "",
    revisions: "",
    category: "",
    features: [],
  });
  const [projects, setProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("currentUser");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Verify token validity by making a request to getUser
        const userResponse = await fetch(
          "http://localhost:7700/api/user/getUser",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!userResponse.ok) {
          localStorage.removeItem("currentUser");
          router.push("/login");
          return;
        }

        const userData = await userResponse.json();
        setUser(userData);
        setAuthChecked(true);

        if (userData.isSeller) {
          // Fetch gigs
          const gigsResponse = await fetch(
            "http://localhost:7700/api/gig/getGigs",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!gigsResponse.ok) throw new Error("Failed to fetch gigs");
          const gigsData = await gigsResponse.json();
          setGigs(gigsData.gigs || []);
          setUserGigs(
            gigsData.gigs.filter(
              (gig) => gig.userId?._id?.toString() === userData._id?.toString()
            )
          );

          // Fetch projects
          const projectsResponse = await fetch(
            "http://localhost:7700/api/project/getProjects",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!projectsResponse.ok) throw new Error("Failed to fetch projects");
          const projectsData = await projectsResponse.json();
          setProjects(projectsData.projects || []);

          // Fetch orders for completed status
          const ordersResponse = await fetch(
            "http://localhost:7700/api/order/getOrder",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!ordersResponse.ok) throw new Error("Failed to fetch orders");
          const ordersData = await ordersResponse.json();

          // Filter completed orders
          const completedOrders = ordersData.data.filter((order) => {
            const isSellerOrder = order.sellerId?._id === userData._id;
            return order.orderStatus === "completed" && isSellerOrder;
          });

          setCompletedOrders(completedOrders);

          // Filter completed projects
          const completedProjects = completedOrders.filter(
            (order) => order.projectId
          );
          setCompletedProjects(completedProjects);
        } else {
          // Buyer logic remains the same
          const ordersResponse = await fetch(
            "http://localhost:7700/api/order/getOrder",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!ordersResponse.ok) throw new Error("Failed to fetch orders");
          const ordersData = await ordersResponse.json();

          setOrders(ordersData.data || []);

          // Filter completed orders for buyer
          const completedOrders = ordersData.data.filter((order) => {
            return order.orderStatus === "completed";
          });

          setCompletedOrders(completedOrders);

          // Filter completed projects for buyer
          const completedProjects = completedOrders.filter(
            (order) => order.projectId
          );
          setCompletedProjects(completedProjects);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load dashboard data");
        localStorage.removeItem("currentUser");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!authChecked) {
    return null;
  }

  const handleEdit = (gig) => {
    setSelectedGig(gig);
    setEditForm({
      title: gig.title,
      shortDesc: gig.shortDesc,
      description: gig.description,
      price: gig.price,
      delivery: gig.delivery,
      revisions: gig.revisions,
      category: gig.category,
      features: [...gig.features],
    });
    setShowEditDialog(true);
  };

  const handleDelete = (gig) => {
    setSelectedGig(gig);
    setShowDeleteDialog(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("currentUser");
      const response = await fetch(
        `http://localhost:7700/api/gig/editGig/${selectedGig._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update gig");
      }

      const updatedGig = await response.json();
      setGigs((prevGigs) =>
        prevGigs.map((gig) => (gig._id === selectedGig._id ? updatedGig : gig))
      );
      setUserGigs((prevUserGigs) =>
        prevUserGigs.map((gig) =>
          gig._id === selectedGig._id ? updatedGig : gig
        )
      );
      setShowEditDialog(false);
      toast.success("Gig updated successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update gig");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("currentUser");
      const response = await fetch(
        `http://localhost:7700/api/gig/deleteGig/${selectedGig._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete gig");
      }

      setGigs((prevGigs) =>
        prevGigs.filter((gig) => gig._id !== selectedGig._id)
      );
      setUserGigs((prevUserGigs) =>
        prevUserGigs.filter((gig) => gig._id !== selectedGig._id)
      );
      setShowDeleteDialog(false);
      toast.success("Gig deleted successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete gig");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!authChecked) {
    return null;
  }

  return (
    <div
      className={`container mx-auto p-6 ${
        showEditDialog || showDeleteDialog ? "overflow-hidden h-screen" : ""
      }`}
    >
      {/* User Profile Section */}
      <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] mb-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-black">
            <img
              src={user?.profilePic || "/images/icons/NoAvatar.svg"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.username}</h1>
            <p className="text-gray-600">{user?.email}</p>
            <div className="mt-2 flex gap-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm border border-black">
                {user?.isSeller ? "Seller" : "Buyer"}
              </span>
              {user?.country && (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm border border-black">
                  {user?.country}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Active Gigs Count */}
        <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Gigs</p>
              <h3 className="text-2xl font-bold mt-1">{userGigs.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Projects Count */}
        <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Projects</p>
              <h3 className="text-2xl font-bold mt-1">{projects.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Completed Gigs Count */}
        <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed Gigs</p>
              <h3 className="text-2xl font-bold mt-1">
                {completedOrders.filter((order) => order.gigId).length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Completed Projects Count */}
        <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed Projects</p>
              <h3 className="text-2xl font-bold mt-1">
                {completedProjects.length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {user?.isSeller ? (
        // Seller Dashboard - Gigs Section
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Gigs</h2>
            <Link
              href="/addGig"
              className="px-4 py-2 border-2 border-black rounded-lg rounded-br-3xl bg-white hover:bg-blue-50 shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(129,197,255,1)] transition-all"
            >
              Create New Gig
            </Link>
          </div>

          {userGigs.length === 0 ? (
            <div className="bg-white p-8 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] text-center">
              <h3 className="text-xl font-semibold mb-2">No gigs found</h3>
              <p className="text-gray-600 mb-4">
                Create your first gig to start selling
              </p>
              <Link
                href="/gigs/create"
                className="inline-block px-6 py-3 border-2 border-black rounded-lg rounded-br-3xl bg-white hover:bg-blue-50 shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(129,197,255,1)] transition-all"
              >
                Create Gig
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userGigs.map((gig) => (
                <div
                  key={gig._id}
                  className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] flex-grow hover:shadow-[8px_8px_0px_0px_rgba(129,197,255,1)] transition-shadow cursor-pointer"
                >
                  {gig.cover && (
                    <img
                      src={gig.cover}
                      alt={gig.title}
                      className="w-full h-48 object-cover rounded-lg mb-4 border border-black"
                    />
                  )}
                  <h3 className="text-xl font-semibold mb-2">{gig.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {gig.shortDesc}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Rs {gig.price}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">★</span>
                      <span className="text-gray-600">
                        {gig.starNumber > 0
                          ? (gig.totalStars / gig.starNumber).toFixed(1)
                          : "0.0"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Features:</h4>
                    <ul className="list-disc list-inside">
                      {gig.features.slice(0, 3).map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                    <span>Delivery: {gig.delivery} days</span>
                    <span>Revisions: {gig.revisions}</span>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(gig);
                      }}
                      className="px-4 py-2 border-2 border-black rounded-lg rounded-br-2xl bg-white hover:bg-green-100 shadow-[3px_3px_0px_0px_rgba(34,197,94)] hover:shadow-[4px_4px_0px_0px_rgba(34,197,94)] transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(gig);
                      }}
                      className="px-4 py-2 border-2 border-black rounded-lg rounded-br-2xl bg-white hover:bg-red-100 shadow-[3px_3px_0px_0px_rgba(239,68,68)] hover:shadow-[4px_4px_0px_0px_rgba(239,68,68)] transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed Orders Section for Seller */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Completed Orders</h2>
            {completedOrders.length === 0 ? (
              <div className="bg-white p-8 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] text-center">
                <h3 className="text-xl font-semibold mb-2">
                  No completed orders
                </h3>
                <p className="text-gray-600">
                  You haven't completed any orders yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] flex-grow hover:shadow-[8px_8px_0px_0px_rgba(129,197,255,1)] transition-shadow"
                  >
                    {order.gigId?.cover && (
                      <img
                        src={order.gigId.cover}
                        alt={order.gigId.title}
                        className="w-full h-48 object-cover rounded-lg mb-4 border border-black"
                      />
                    )}
                    <h3 className="text-xl font-semibold mb-2">
                      {order.gigId?.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {order.gigId?.shortDesc}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold">
                        Rs {order.price}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500">★</span>
                        <span className="text-gray-600">
                          {order.gigId?.starNumber > 0
                            ? (
                                order.gigId.totalStars / order.gigId.starNumber
                              ).toFixed(1)
                            : "0.0"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Status:</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs border border-black">
                          Completed
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Escrow:</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs border border-black">
                          Released
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                      <span>Delivery: {order.gigId?.delivery} days</span>
                      <span>Revisions: {order.gigId?.revisions}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Buyer Dashboard - Orders Section
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
          {orders.length === 0 ? (
            <div className="bg-white p-8 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] text-center">
              <h3 className="text-xl font-semibold mb-2">No orders found</h3>
              <p className="text-gray-600 mb-4">
                You haven't placed any orders yet
              </p>
              <Link
                href="/gigs"
                className="inline-block px-6 py-3 border-2 border-black rounded-lg rounded-br-3xl bg-white hover:bg-blue-50 shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(129,197,255,1)] transition-all"
              >
                Browse Gigs
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] flex-grow hover:shadow-[8px_8px_0px_0px_rgba(129,197,255,1)] transition-shadow"
                >
                  {order.gigId?.cover && (
                    <img
                      src={order.gigId.cover}
                      alt={order.gigId.title}
                      className="w-full h-48 object-cover rounded-lg mb-4 border border-black"
                    />
                  )}
                  <h3 className="text-xl font-semibold mb-2">
                    {order.gigId?.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {order.gigId?.shortDesc}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Rs {order.price}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">★</span>
                      <span className="text-gray-600">
                        {order.gigId?.starNumber > 0
                          ? (
                              order.gigId.totalStars / order.gigId.starNumber
                            ).toFixed(1)
                          : "0.0"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs border border-black ${
                          order.orderStatus === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.orderStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Payment:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs border border-black ${
                          order.isPaid === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.isPaid === "completed" ? "Paid" : "Pending"}
                      </span>
                    </div>
                    {order.escrowId && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Escrow:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs border border-black ${
                            order.escrowId.status === "released"
                              ? "bg-green-100 text-green-800"
                              : order.escrowId.status === "holding"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.escrowId.status}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                    <span>Delivery: {order.gigId?.delivery} days</span>
                    <span>Revisions: {order.gigId?.revisions}</span>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Link
                      href={`/orders/${order._id}`}
                      className="px-4 py-2 border-2 border-black rounded-lg rounded-br-2xl bg-white hover:bg-blue-50 shadow-[3px_3px_0px_0px_rgba(59,130,246)] hover:shadow-[4px_4px_0px_0px_rgba(59,130,246)] transition-all"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed Orders Section for Buyer */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Completed Orders</h2>
            {completedOrders.length === 0 ? (
              <div className="bg-white p-8 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] text-center">
                <h3 className="text-xl font-semibold mb-2">
                  No completed orders
                </h3>
                <p className="text-gray-600">
                  You haven't completed any orders yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] flex-grow hover:shadow-[8px_8px_0px_0px_rgba(129,197,255,1)] transition-shadow"
                  >
                    {order.gigId?.cover && (
                      <img
                        src={order.gigId.cover}
                        alt={order.gigId.title}
                        className="w-full h-48 object-cover rounded-lg mb-4 border border-black"
                      />
                    )}
                    <h3 className="text-xl font-semibold mb-2">
                      {order.gigId?.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {order.gigId?.shortDesc}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold">
                        Rs {order.price}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500">★</span>
                        <span className="text-gray-600">
                          {order.gigId?.starNumber > 0
                            ? (
                                order.gigId.totalStars / order.gigId.starNumber
                              ).toFixed(1)
                            : "0.0"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Status:</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs border border-black">
                          Completed
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Escrow:</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs border border-black">
                          Released
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                      <span>Delivery: {order.gigId?.delivery} days</span>
                      <span>Revisions: {order.gigId?.revisions}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-white">
              <h2 className="text-2xl font-bold sticky top-0 bg-white py-2 border-b-2 border-black">
                Edit Gig
              </h2>
            </div>

            {/* Scrollable form content - flex-1 makes it take remaining space */}
            <form
              id="editForm"
              onSubmit={handleEditSubmit}
              className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4"
            >
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full p-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={editForm.shortDesc}
                  onChange={(e) =>
                    setEditForm({ ...editForm, shortDesc: e.target.value })
                  }
                  className="w-full p-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full p-2 border-2 border-black rounded-lg h-32 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>

              {/* Price and Delivery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price (Rs)
                  </label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
                    }
                    className="w-full p-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Delivery (days)
                  </label>
                  <input
                    type="number"
                    value={editForm.delivery}
                    onChange={(e) =>
                      setEditForm({ ...editForm, delivery: e.target.value })
                    }
                    className="w-full p-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Revisions and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Revisions
                  </label>
                  <input
                    type="number"
                    value={editForm.revisions}
                    onChange={(e) =>
                      setEditForm({ ...editForm, revisions: e.target.value })
                    }
                    className="w-full p-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="w-full p-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Graphics & Design">Graphics & Design</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Writing & Translation">
                      Writing & Translation
                    </option>
                    <option value="Video & Animation">Video & Animation</option>
                    <option value="Music & Audio">Music & Audio</option>
                    <option value="Programming & Tech">
                      Programming & Tech
                    </option>
                    <option value="Data">Data</option>
                    <option value="Business">Business</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Features
                </label>
                <div className="space-y-3">
                  {editForm.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...editForm.features];
                          newFeatures[index] = e.target.value;
                          setEditForm({ ...editForm, features: newFeatures });
                        }}
                        className="flex-1 p-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newFeatures = editForm.features.filter(
                            (_, i) => i !== index
                          );
                          setEditForm({ ...editForm, features: newFeatures });
                        }}
                        className="px-3 py-2 border-2 border-black rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(220,38,38)] hover:shadow-[3px_3px_0px_0px_rgba(220,38,38)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm({
                        ...editForm,
                        features: [...editForm.features, ""],
                      });
                    }}
                    className="w-full px-3 py-2 border-2 border-black rounded-lg bg-green-500 text-white hover:bg-green-600 shadow-[2px_2px_0px_0px_rgba(34,197,94)] hover:shadow-[3px_3px_0px_0px_rgba(34,197,94)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                  >
                    Add Feature
                  </button>
                </div>
              </div>
            </form>

            {/* Fixed footer buttons (not sticky anymore) */}
            <div className="bg-white pt-4 pb-2 border-t-2 border-black">
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowEditDialog(false)}
                  className="px-4 py-2 border-2 border-black rounded-lg rounded-br-2xl bg-white hover:bg-gray-100 shadow-[3px_3px_0px_0px_rgba(156,163,175)] hover:shadow-[4px_4px_0px_0px_rgba(156,163,175)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="editForm" // Added form attribute to link to the form
                  className="px-4 py-2 border-2 border-black rounded-lg rounded-br-2xl bg-green-500 text-white hover:bg-green-600 shadow-[3px_3px_0px_0px_rgba(34,197,94)] hover:shadow-[4px_4px_0px_0px_rgba(34,197,94)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Delete Gig</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this gig? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 border-2 border-black rounded-lg rounded-br-2xl bg-white hover:bg-gray-100 shadow-[3px_3px_0px_0px_rgba(156,163,175)] hover:shadow-[4px_4px_0px_0px_rgba(156,163,175)] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 border-2 border-black rounded-lg rounded-br-2xl bg-red-500 text-white hover:bg-red-600 shadow-[3px_3px_0px_0px_rgba(239,68,68)] hover:shadow-[4px_4px_0px_0px_rgba(239,68,68)] transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
