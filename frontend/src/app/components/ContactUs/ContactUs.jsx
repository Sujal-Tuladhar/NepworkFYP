import React from "react";

const ContactUs = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Title with custom styling */}
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-bold text-center">
          Review and Feedback Form
        </h1>
        <hr className="border-4 border-black w-96  " />
      </div>

      {/* Contact Form Container */}
      <div className="flex justify-center">
        <div className="border-4 border-black border-r-8 border-b-8 rounded-tr-lg p-6 w-full max-w-4xl">
          <div className="aspect-w-16 aspect-h-9 w-full">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLScWBQ_Xz8Y6tOXUN1WlynSvz8nTRAwxuZbhF3OYG95A3ehXCw/viewform?embedded=true&hl=en"
              width="100%"
              height="600"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
              className="overflow-hidden"
              title="Feedback Form"
            >
              Loading…
            </iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
