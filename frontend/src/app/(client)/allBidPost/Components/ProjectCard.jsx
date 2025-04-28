import React from "react";
import { useRouter } from "next/navigation";

const ProjectCard = ({ project, isSeller }) => {
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
        className={`w-full py-2 px-4 font-medium transition-all duration-200 border-2 border-black rounded-lg rounded-br-3xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
          isExpired
            ? "bg-gray-200 text-gray-600 cursor-not-allowed shadow-none"
            : "bg-white hover:bg-blue-50 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]"
        }`}
      >
        {isExpired ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Project Closed
          </span>
        ) : isSeller ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Place a Bid
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View Bid
          </span>
        )}
      </button>
    </div>
  );
};

export default ProjectCard;
