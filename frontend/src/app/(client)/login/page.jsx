"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";

const LoginPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:7700/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        // Show the error from the server (e.g., incorrect password or email) in a toast.
        toast.error("Invalid email or password");
        return; // stop further execution if login fails
      }

      // Successful login
      login(data.token, data.user);
      toast.success("Logged in successfully!");

      router.push("/dashboard");
    } catch (err) {
      // Network or unexpected error
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex items-center justify-center p-35 bg-gray-100 overflow-hidden">
      {/* Toast container */}
      <Toaster richColors position="top-right" />

      <div className="w-full max-w-[30rem] p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,128,0,0.5)]">
        <div className="flex justify-end mb-6">
          <h2 className="text-2xl font-bold text-gray-800 pb-2 border-b-2 border-l-2 border-black pl-3 pr-1">
            Login
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 mt-3">
            <label htmlFor="email">E-Mail</label>
            <input
              type="email"
              name="email"
              placeholder="E-Mail"
              className="border-2 p-1"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-2 mt-3 mb-6">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="border-2 p-1"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-12 py-1.5 bg-blue-200 border-2 rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4">
          <hr className="border-t-4 border-black mt-5" />
          <div className="flex justify-between items-center mt-2">
            <p className="text-base">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-500 underline">
                Register
              </Link>
            </p>
            <Link
              href="/forgot"
              className="text-base text-blue-500 hover:underline focus:outline-none"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
