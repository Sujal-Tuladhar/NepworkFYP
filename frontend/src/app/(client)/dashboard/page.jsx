"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";

const Dashboard = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [user, setUser] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
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

        // Fetch gigs data only after confirming user is authenticated
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

      {/* Gigs Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Your Gigs</h2>
        {userGigs.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No gigs found</h3>
            <p className="text-gray-600">
              {user?.isSeller
                ? "Create your first gig to start selling"
                : "You haven't created any gigs yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userGigs.map((gig) => (
              <div
                key={gig._id}
                className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] flex-grow hover:shadow-[8px_8px_0px_0px_rgba(129,197,255,1)] transition-shadow"
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
                  <span className="text-lg font-bold">${gig.price}</span>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
