"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";

const AddGigPage = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    shortTitle: "",
    description: "",
    shortDesc: "",
    category: "",
    price: "",
    cover: "",
    images: [],
    delivery: "",
    revisions: "",
    features: [""],
  });

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }

      try {
        const token = localStorage.getItem("currentUser");
        const response = await fetch("http://localhost:7700/api/user/getUser", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();
        setUser(data);

        if (!data.isSeller) {
          toast.error("Please verify as a seller to create gigs");
          router.push("/profile");
          return;
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [isLoggedIn, router]);

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("currentUser");
      const response = await fetch("http://localhost:7700/api/gig/createGig", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          delivery: Number(formData.delivery),
          revisions: Number(formData.revisions),
          starNumber: 0,
          totalStars: 0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create gig");
      }

      toast.success("Gig created successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
          <h1 className="text-2xl font-bold mb-6">Create New Gig</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                required
                className="w-full p-2 border-2 border-black rounded-lg"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Short Title
              </label>
              <input
                type="text"
                required
                className="w-full p-2 border-2 border-black rounded-lg"
                value={formData.shortTitle}
                onChange={(e) =>
                  setFormData({ ...formData, shortTitle: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                required
                className="w-full p-2 border-2 border-black rounded-lg h-32"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Short Description
              </label>
              <textarea
                required
                className="w-full p-2 border-2 border-black rounded-lg h-24"
                value={formData.shortDesc}
                onChange={(e) =>
                  setFormData({ ...formData, shortDesc: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                required
                className="w-full p-2 border-2 border-black rounded-lg"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Price ($)
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full p-2 border-2 border-black rounded-lg"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Cover Image URL
              </label>
              <input
                type="text"
                required
                className="w-full p-2 border-2 border-black rounded-lg"
                value={formData.cover}
                onChange={(e) =>
                  setFormData({ ...formData, cover: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Delivery Time (days)
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full p-2 border-2 border-black rounded-lg"
                value={formData.delivery}
                onChange={(e) =>
                  setFormData({ ...formData, delivery: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Number of Revisions
              </label>
              <input
                type="number"
                required
                min="0"
                className="w-full p-2 border-2 border-black rounded-lg"
                value={formData.revisions}
                onChange={(e) =>
                  setFormData({ ...formData, revisions: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Features</label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border-2 border-black rounded-lg"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Add Feature
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Create Gig
            </button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="bg-white p-6 border-2 border-black rounded-lg rounded-br-3xl shadow-[4px_4px_0px_0px_rgba(129,197,255,1)]">
          <h2 className="text-2xl font-bold mb-6">Preview</h2>
          <div className="space-y-4">
            {formData.cover && (
              <img
                src={formData.cover}
                alt="Gig Cover"
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <h3 className="text-xl font-semibold">{formData.title}</h3>
            <p className="text-gray-600">{formData.shortDesc}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">${formData.price}</span>
              <span className="text-gray-600">
                Delivery: {formData.delivery} days
              </span>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Features:</h4>
              <ul className="list-disc list-inside">
                {formData.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGigPage;
