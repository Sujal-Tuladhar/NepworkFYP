import React from "react";
import { useRouter } from "next/navigation";

const ProjectCard = ({ project }) => {
  const router = useRouter();

  // Calculate time remaining (keep existing logic)
  const now = new Date();
  const expiryDate = new Date(project.expiryDate);
  const timeRemaining = expiryDate - now;
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
  const isExpired = timeRemaining <= 0;

  return (
    <div
      className={`bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)] flex-grow hover:shadow-[8px_8px_0px_0px_rgba(129,197,255,1)] transition-shadow cursor-pointer ${
        isExpired ? "opacity-70" : ""
      }`}
      onClick={() => !isExpired && router.push(`/allBidPost/${project._id}`)}
    >
      <div className="flex justify-between items-start mb-3 gap-2">
        <h2 className="text-lg font-bold line-clamp-2">{project.title}</h2>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            isExpired ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
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
          <p className="text-sm font-medium">
            Rs {project.budgetMin.toLocaleString()} - Rs{" "}
            {project.budgetMax.toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-500">Duration</p>
          <p className="text-sm font-medium">
            {project.expectedDurationDays} days
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-500">Category</p>
          <p className="text-sm font-medium">{project.category}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-500">Client</p>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full mr-1 overflow-hidden border border-black">
              <img
                src={project.clientId.profilePic}
                alt={project.clientId.username}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium truncate">
              {project.clientId.username}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          !isExpired && router.push(`/allBidPost/${project._id}`);
        }}
        disabled={isExpired}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors border-2 ${
          isExpired
            ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
            : "bg-white text-black border-black hover:bg-gray-100"
        }`}
      >
        {isExpired ? "Project Closed" : "Place a Bid"}
      </button>
    </div>
  );
};

export default ProjectCard;
