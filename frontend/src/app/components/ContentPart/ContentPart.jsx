"use client";

import React from "react";
import Image from "next/image";

function ContentPart() {
  return (
    <section className="bg-[#f1fdf7] flex justify-center py-20">
      <div className="container flex flex-col lg:flex-row w-full max-w-[1200px] items-center gap-16 px-6">
        {/* Left Section */}
        <div className="flex flex-col gap-6 flex-1">
          <h1 className="text-3xl font-semibold text-gray-900 leading-tight underline">
            Get your work done with{" "}
            <span className="text-green-600">NepWork</span>
          </h1>

          <div className="flex flex-col gap-4">
            {/* Feature Cards with Custom Borders */}
            {[
              {
                text: "The best for every budget",
                desc: "Find high-quality services at every price point. No hourly rates, just project-based pricing.",
              },
              {
                text: "Quality work done quickly",
                desc: "Find the right freelancer to begin working on your project within minutes.",
              },
              {
                text: "Protected payments, every time",
                desc: "Always know what you'll pay upfront. Your payment isn't released until you approve the work.",
              },
              {
                text: "24/7 Support",
                desc: "We're always here to help. Get support anytime, anywhere.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-4 border-t-4 border-l-4 border-r-8 border-b-8 border-black rounded-tr-lg shadow-md flex items-start gap-4"
              >
                <Image
                  src="/images/Global/checkbox.svg"
                  alt="checkbox"
                  width={28}
                  height={28}
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-800">
                    {feature.text}
                  </h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section (Video) */}
        <div className="relative flex-1">
          <div className="overflow-hidden rounded-xl shadow-lg">
            <iframe
              className="w-full h-96 rounded-xl"
              width="720"
              src="https://www.youtube.com/embed/GDlkCkcIqTs"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContentPart;
