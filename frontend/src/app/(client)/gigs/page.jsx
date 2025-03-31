"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const GigsPage = () => {
  const router = useRouter();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    sortBy: "newest", // newest, popular, bestSelling
  });

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const token = localStorage.getItem("currentUser");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("http://localhost:7700/api/gig/getGigs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch gigs");
        const data = await response.json();
        setGigs(data);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load gigs");
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, [router]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredAndSortedGigs = gigs
    .filter((gig) => {
      const price = gig.price;
      const minPrice = filters.minPrice ? Number(filters.minPrice) : 0;
      const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : Infinity;
      return price >= minPrice && price <= maxPrice;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "popular":
          return b.starNumber - a.starNumber;
        case "bestSelling":
          return b.totalStars - a.totalStars;
        default:
          return 0;
      }
    });

  if (loading) {
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
        {filteredAndSortedGigs.map((gig) => (
          <div
            key={gig._id}
            className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] flex-grow hover:shadow-[8px_8px_0px_0px_rgba(129,197,255,1)] transition-shadow cursor-pointer"
            onClick={() => router.push(`/gig/${gig._id}`)}
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

      {/* No Results Message */}
      {filteredAndSortedGigs.length === 0 && (
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
