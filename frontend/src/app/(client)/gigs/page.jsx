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
  const [selectedGig, setSelectedGig] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    shortTitle: "",
    description: "",
    shortDesc: "",
    category: "",
    price: "",
    cover: "",
    delivery: "",
    revisions: "",
    features: [""],
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

  const handleEditClick = (gig) => {
    setSelectedGig(gig);
    setEditFormData({
      title: gig.title,
      shortTitle: gig.shortTitle,
      description: gig.description,
      shortDesc: gig.shortDesc,
      category: gig.category,
      price: gig.price,
      cover: gig.cover,
      delivery: gig.delivery,
      revisions: gig.revisions,
      features: gig.features || [""],
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (gig) => {
    setSelectedGig(gig);
    setIsDeleteDialogOpen(true);
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
          body: JSON.stringify(editFormData),
        }
      );

      if (!response.ok) throw new Error("Failed to update gig");

      toast.success("Gig updated successfully!");
      setIsEditDialogOpen(false);
      fetchGigs();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update gig");
    }
  };

  const handleDelete = async () => {
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

      if (!response.ok) throw new Error("Failed to delete gig");

      toast.success("Gig deleted successfully!");
      setIsDeleteDialogOpen(false);
      fetchGigs();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete gig");
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...editFormData.features];
    newFeatures[index] = value;
    setEditFormData({ ...editFormData, features: newFeatures });
  };

  const addFeature = () => {
    setEditFormData({
      ...editFormData,
      features: [...editFormData.features, ""],
    });
  };

  const removeFeature = (index) => {
    const newFeatures = editFormData.features.filter((_, i) => i !== index);
    setEditFormData({ ...editFormData, features: newFeatures });
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
            {isLoggedIn && user && user._id === gig.userId && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEditClick(gig)}
                  className="px-4 py-2  hover:bg-green-300 rounded-md border-2 border-black
             shadow-[3px_3px_0_0_rgba(74,222,128)] hover:shadow-[3px_3px_0_0_rgba(34,197,94)]
             active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
             transition-all duration-150 font-medium text-gray-900 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(gig)}
                  className="px-4 py-2  hover:bg-red-300 rounded-md border-2 border-black
             shadow-[3px_3px_0_0_rgba(239,68,68)] hover:shadow-[3px_3px_0_0_rgba(220,38,38)]
             active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
             transition-all duration-150 font-medium text-gray-900"
                >
                  Delete
                </button>
              </div>
            )}
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

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Gig</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border-2 border-black rounded-lg"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Short Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border-2 border-black rounded-lg"
                  value={editFormData.shortTitle}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      shortTitle: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  required
                  className="w-full p-2 border-2 border-black rounded-lg h-32"
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Short Description
                </label>
                <textarea
                  required
                  className="w-full p-2 border-2 border-black rounded-lg h-24"
                  value={editFormData.shortDesc}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      shortDesc: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  required
                  className="w-full p-2 border-2 border-black rounded-lg"
                  value={editFormData.category}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      category: e.target.value,
                    })
                  }
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full p-2 border-2 border-black rounded-lg"
                  value={editFormData.price}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, price: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border-2 border-black rounded-lg"
                  value={editFormData.cover}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, cover: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Delivery Time (days)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full p-2 border-2 border-black rounded-lg"
                  value={editFormData.delivery}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      delivery: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Number of Revisions
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full p-2 border-2 border-black rounded-lg"
                  value={editFormData.revisions}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      revisions: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Features
                </label>
                {editFormData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 p-2 border-2 border-black rounded-lg"
                      value={feature}
                      onChange={(e) =>
                        handleFeatureChange(index, e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Feature
                </button>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
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
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Delete Gig</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this gig? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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

export default GigsPage;
