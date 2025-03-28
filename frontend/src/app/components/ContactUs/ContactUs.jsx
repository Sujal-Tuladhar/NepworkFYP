import React from "react";

const ContactUs = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Title with custom styling */}
      <div className="flex flex-col items-center mb-5">
        <p className="text-4xl">Contact Us</p>
        <hr className="border-4 border-black w-[200px] transform -skew-x-12 mt-2" />
      </div>
      {/* Thick slanted bottom border */}

      {/* Contact Form */}
      <div className="border-4 border-black border-r-8 border-b-8 rounded-tr-lg p-6">
        <form className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-lg font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              required
            />
          </div>

          {/* Feedback Input */}
          <div>
            <label
              htmlFor="feedback"
              className="block text-lg font-medium text-gray-700"
            >
              Feedback
            </label>
            <textarea
              id="feedback"
              name="feedback"
              rows={4}
              placeholder="Enter your feedback"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-black text-white font-bold rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
            >
              Contact Us
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
