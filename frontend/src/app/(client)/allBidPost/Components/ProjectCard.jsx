import React from "react";
import { useRouter } from "next/navigation";

const ProjectCard = ({ project }) => {
  const router = useRouter();

  // Calculate time remaining
  const now = new Date();
  const expiryDate = new Date(project.expiryDate);
  const timeRemaining = expiryDate - now;
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
  const isExpired = timeRemaining <= 0;

  return (
    <div
      className={`border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${
        isExpired ? "opacity-70 grayscale-[30%]" : ""
      }`}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3 gap-2">
          <h2 className="text-lg font-bold text-gray-800 line-clamp-2">
            {project.title}
          </h2>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              isExpired
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {isExpired
              ? "Expired"
              : `${daysRemaining} ${daysRemaining === 1 ? "day" : "days"}`}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {project.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Budget</p>
            <p className="text-sm font-medium text-gray-800">
              Rs {project.budgetMin.toLocaleString()} - Rs{" "}
              {project.budgetMax.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Duration</p>
            <p className="text-sm font-medium text-gray-800">
              {project.expectedDurationDays} days
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Category</p>
            <p className="text-sm font-medium text-gray-800">
              {project.category}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Client</p>
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full mr-1 overflow-hidden">
                <img
                  src={project.clientId.profilePic}
                  alt={project.clientId.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-medium text-gray-800 truncate">
                {project.clientId.username}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push(`/allBidPost/${project._id}`)}
          disabled={isExpired}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isExpired
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isExpired ? "Project Closed" : "Place a Bid"}
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
