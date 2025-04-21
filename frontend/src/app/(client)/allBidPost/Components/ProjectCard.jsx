import React from "react";
import { useRouter } from "next/navigation";

const ProjectCard = ({ project }) => {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
        <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Budget: ${project.budgetMin} - ${project.budgetMax}
          </p>
          <p className="text-sm text-gray-500">
            Duration: {project.expectedDurationDays} days
          </p>
          <p className="text-sm text-gray-500">Category: {project.category}</p>
          <div className="flex items-center mt-2">
            <img
              src={project.clientId.profilePic}
              alt={project.clientId.username}
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className="text-sm text-gray-600">
              {project.clientId.username}
            </span>
          </div>
        </div>
        <button
          onClick={() => router.push(`/bidPost/${project._id}`)}
          className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
