import React from "react";
import Link from "next/link";

function Footer() {
  return (
    <div>
      <div className="w-full h-[650px] border-2 border-black flex items-center justify-center">
        <div className="relative w-[1400px] h-[500px] border-4 border-black rounded-tr-[3rem] top-5">
          {/* Logo Text */}
          <p className="absolute left-[-30px] top-[-30px] text-4xl font-bold border-2 border-b-8 border-r-8 border-black p-4 rounded-bl-[4rem] bg-white shadow-lg">
            NepWork
          </p>

          {/* Four Column Content */}
          <div className="grid grid-cols-4 gap-8 p-12 mt-16">
            {/* Column 1 - About */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold mb-4">About NepWork</h3>
              <p className="text-gray-600 mb-4">
                Connecting Nepali professionals worldwide. Find jobs,
                collaborate, and grow your career with our platform.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-gray-600 hover:text-black">
                  <i className="fab fa-facebook-f"></i>
                </Link>
                <Link href="#" className="text-gray-600 hover:text-black">
                  <i className="fab fa-twitter"></i>
                </Link>
                <Link href="#" className="text-gray-600 hover:text-black">
                  <i className="fab fa-linkedin-in"></i>
                </Link>
              </div>
            </div>

            {/* Column 2 - Quick Links */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <Link href="#" className="text-gray-600 hover:text-black">
                Find Jobs
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black">
                Post a Job
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black">
                Hire Talent
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black">
                Success Stories
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black">
                Resources
              </Link>
            </div>

            {/* Column 3 - Services */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-bold mb-4">Services</h3>
              <Link href="#" className="text-gray-600 hover:text-black">
                Remote Jobs
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black">
                Freelance Work
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black">
                Career Guidance
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black">
                Skill Assessment
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black">
                Resume Builder
              </Link>
            </div>

            {/* Column 4 - Contact */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p className="text-gray-600">Kathmandu, Nepal</p>
              <p className="text-gray-600">Phone: +977 1234567890</p>
              <p className="text-gray-600">Email: info@nepwork.com</p>
              <Link href="#" className="text-gray-600 hover:text-black">
                Support Center
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black">
                FAQ
              </Link>
            </div>
          </div>

          {/* Bottom Copyright Section */}
          <div className="absolute bottom-3 w-full px-4 flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 Nepwork. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                className="text-sm hover:underline underline-offset-4"
                href="#"
              >
                Terms of Service
              </Link>
              <Link
                className="text-sm hover:underline underline-offset-4"
                href="#"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
