"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";

const GigsPage = () => {
  const router = useRouter();
  const { isLoggedIn, user, loading: authLoading } = useAuth();

  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    sortBy: "newest",
    category: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
  });

  const categories = [
    "Graphics & Design",
    "Digital Marketing",
    "Writing & Translation",
    "Video & Animation",
    "Music & Audio",
    "Programming & Tech",
    "Data",
    "Business",
    "Lifestyle",
  ];

  const fetchGigs = async () => {
    try {
      const token = localStorage.getItem("currentUser");
      if (!token) {
        router.push("/login");
        return;
      }

      const queryParams = new URLSearchParams({
        page: pagination.page,
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.category && { category: filters.category }),
      });

      const response = await fetch(
        `http://localhost:7700/api/gig/getGigs?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch gigs");
      const data = await response.json();
      setGigs(data.gigs || []);
      setPagination({
        page: data.pagination.page,
        total: data.pagination.total,
        pages: data.pagination.pages,
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load gigs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchGigs();
    }
  }, [filters, pagination.page, authLoading]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Filters and Sort Section */}
      <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Price Filters */}
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Min Price
              </label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="w-32 p-2 border-2 border-black rounded-lg"
                placeholder="Min"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Max Price
              </label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-32 p-2 border-2 border-black rounded-lg"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-48 p-2 border-2 border-black rounded-lg"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium mb-1">Sort By</label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="w-48 p-2 border-2 border-black rounded-lg"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="bestSelling">Best Selling</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gigs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gigs.map((gig) => (
          <div
            key={gig._id}
            className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] flex-grow hover:shadow-[8px_8px_0px_0px_rgba(129,197,255,1)] transition-shadow cursor-pointer"
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
            <p className="text-gray-600 mb-4 line-clamp-2">{gig.shortDesc}</p>
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
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 border-2 border-black rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 border-2 border-black rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* No Results Message */}
      {gigs.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No gigs found</h3>
          <p className="text-gray-600">
            Try adjusting your filters to see more results
          </p>
        </div>
      )}
    </div>
  );
};

export default GigsPage;
