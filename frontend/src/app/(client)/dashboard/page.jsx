"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";

const Dashboard = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [user, setUser] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [orders, setOrders] = useState([]);
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
          // If token is invalid, clear it and redirect to login
          localStorage.removeItem("currentUser");
          router.push("/login");
          return;
        }

        const userData = await userResponse.json();
        setUser(userData);
        setAuthChecked(true);

        // Fetch data based on user type
        if (userData.isSeller) {
          // Fetch gigs for sellers
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
          setPagination({
            page: gigsData.pagination.page,
            total: gigsData.pagination.total,
            pages: gigsData.pagination.pages,
          });
        } else {
          // Fetch orders for buyers
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
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load dashboard data");
        // If there's an error, clear token and redirect to login
        localStorage.removeItem("currentUser");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  // Only render the dashboard content after authentication is confirmed
  if (!authChecked) {
    return null;
  }

  const userGigs = gigs.filter((gig) => gig.userId === user?._id);

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
      setShowDeleteDialog(false);
      toast.success("Gig deleted successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete gig");
    }
  };

  return (
    <div className="container mx-auto p-6">
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
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {user?.isSeller ? "Seller" : "Buyer"}
              </span>
              {user?.country && (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  {user?.country}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {user?.isSeller ? (
        // Seller Dashboard - Gigs Section
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Gigs</h2>
          {userGigs.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No gigs found</h3>
              <p className="text-gray-600">
                Create your first gig to start selling
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userGigs.map((gig) => (
                <div
                  key={gig._id}
                  className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] flex-grow hover:shadow-[8px_8px_0px_0px_rgba(129,197,255,1)] transition-shadow"
                  onClick={() => router.push(`/gigs/${gig._id}`)}
                >
                  {gig.cover && (
                    <img
                      src={gig.cover}
                      alt={gig.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
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
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(gig)}
                      className="px-4 py-2 hover:bg-green-300 rounded-md border-2 border-black
                      shadow-[3px_3px_0_0_rgba(74,222,128)] hover:shadow-[3px_3px_0_0_rgba(34,197,94)]
                      active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
                      transition-all duration-150 font-medium text-gray-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(gig)}
                      className="px-4 py-2 hover:bg-red-300 rounded-md border-2 border-black
                      shadow-[3px_3px_0_0_rgba(239,68,68)] hover:shadow-[3px_3px_0_0_rgba(220,38,38)]
                      active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
                      transition-all duration-150 font-medium text-gray-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Buyer Dashboard - Orders Section
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No orders found</h3>
              <p className="text-gray-600">You haven't placed any orders yet</p>
              <Link
                href="/gigs"
                className="mt-4 inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
                      className="w-full h-48 object-cover rounded-lg mb-4"
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
                        className={`px-2 py-1 rounded-full text-xs ${
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
                        className={`px-2 py-1 rounded-full text-xs ${
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
                          className={`px-2 py-1 rounded-full text-xs ${
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
                  <div className="mt-4 flex justify-end gap-2">
                    <Link
                      href={`/orders/${order._id}`}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Edit Gig</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full p-2 border-2 border-black rounded-lg"
                  required
                />
              </div>
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
                  className="w-full p-2 border-2 border-black rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full p-2 border-2 border-black rounded-lg h-32"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
                    }
                    className="w-full p-2 border-2 border-black rounded-lg"
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
                    className="w-full p-2 border-2 border-black rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                    className="w-full p-2 border-2 border-black rounded-lg"
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
                    className="w-full p-2 border-2 border-black rounded-lg"
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
              <div>
                <label className="block text-sm font-medium mb-1">
                  Features
                </label>
                <div className="space-y-2">
                  {editForm.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...editForm.features];
                          newFeatures[index] = e.target.value;
                          setEditForm({ ...editForm, features: newFeatures });
                        }}
                        className="flex-1 p-2 border-2 border-black rounded-lg"
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
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Add Feature
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditDialog(false)}
                  className="px-4 py-2 border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Delete Gig</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this gig? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
