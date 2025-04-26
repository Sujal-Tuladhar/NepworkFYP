"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import ProjectCard from "./Components/ProjectCard";

const AllBidPost = () => {
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minBudget: "",
    maxBudget: "",
    sortBy: "newest",
    page: 1,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("currentUser");
        const response = await axios.get(
          "http://localhost:7700/api/project/getProjects",
          {
            params: filters,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProjects(response.data.projects);
        setCategories(response.data.categories);
        setPagination({
          total: response.data.total,
          pages: response.data.pages,
          currentPage: response.data.currentPage,
        });
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Toaster richColors position="top-right" />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          All Bid Projects
        </h1>

        {/* Filters - Updated Design */}
        <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search projects..."
                className="w-full p-2 border-2 border-black rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full p-2 border-2 border-black rounded-lg"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Min Budget
              </label>
              <input
                type="number"
                name="minBudget"
                value={filters.minBudget}
                onChange={handleFilterChange}
                placeholder="Min budget"
                className="w-full p-2 border-2 border-black rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Max Budget
              </label>
              <input
                type="number"
                name="maxBudget"
                value={filters.maxBudget}
                onChange={handleFilterChange}
                placeholder="Max budget"
                className="w-full p-2 border-2 border-black rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="w-full p-2 border-2 border-black rounded-lg"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="budgetHigh">Highest Budget</option>
                <option value="budgetLow">Lowest Budget</option>
                <option value="durationShort">Shortest Duration</option>
                <option value="durationLong">Longest Duration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid - Wrapper style updated */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>

        {/* Pagination - Updated Design */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 border-2 border-black rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {pagination.currentPage} of {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.pages}
              className="px-4 py-2 border-2 border-black rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBidPost;
