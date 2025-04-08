"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";
import upload from "@/app/utils/upload";

const AddGigPage = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
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

  const categories = [
    "Graphics & Design",
    "Digital Marketing",
    "Writing & Translation",
    "Video & Animation",
    "Music & Audio",
    "Programming & Tech",
    "Data",
    "Business",
    "Lifestyle",
  ];

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await upload(file);
      if (url) {
        setFormData({ ...formData, cover: url });
        toast.success("Cover image uploaded successfully!");
      } else {
        toast.error("Failed to upload cover image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload cover image");
    } finally {
      setUploading(false);
    }
  };

  const handleImagesUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (formData.images.length >= 3) {
      toast.error("You can only upload up to 3 images");
      return;
    }

    setUploadingImages(true);
    try {
      const url = await upload(file);
      if (!url) throw new Error("Failed to upload image");
      setFormData({ ...formData, images: [...formData.images, url] });
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImages(false);
    }
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
            {/* Title Section */}
            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="Enter gig title"
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
                  placeholder="Enter short title"
                />
              </div>
            </div>

            {/* Description Section */}
            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="Describe your gig in detail"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Short Description
                </label>
                <textarea
                  required
                  className="w-full p-2 border-2 border-black rounded-lg h-32"
                  value={formData.shortDesc}
                  onChange={(e) =>
                    setFormData({ ...formData, shortDesc: e.target.value })
                  }
                  placeholder="Brief description for the gig card"
                />
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cover Image
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="flex-1 p-2 border-2 border-black rounded-lg cursor-pointer text-center hover:bg-gray-50"
                  >
                    {uploading ? "Uploading..." : "Choose Cover Image"}
                  </label>
                  {formData.cover && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-black">
                      <img
                        src={formData.cover}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Additional Images (Max 3)
                </label>
                <div className="space-y-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-black relative">
                        <img
                          src={image}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = formData.images.filter(
                              (_, i) => i !== index
                            );
                            setFormData({
                              ...formData,
                              images: newImages,
                            });
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                      <span className="text-sm text-gray-600">
                        Image {index + 1}
                      </span>
                    </div>
                  ))}
                  {formData.images.length < 3 && (
                    <div className="flex gap-2 items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImagesUpload}
                        className="hidden"
                        id="images-upload"
                      />
                      <label
                        htmlFor="images-upload"
                        className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50"
                      >
                        {uploadingImages ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-black"></div>
                        ) : (
                          <span className="text-2xl text-gray-400">+</span>
                        )}
                      </label>
                      <span className="text-sm text-gray-600">
                        Add Image ({formData.images.length}/3)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Category and Price Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  required
                  className="w-full p-2 border-2 border-black rounded-lg"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price (Rs)
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
                  placeholder="Enter price"
                />
              </div>
            </div>

            {/* Delivery and Revisions Section */}
            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="Enter delivery time"
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
                  placeholder="Enter number of revisions"
                />
              </div>
            </div>

            {/* Features Section */}
            <div>
              <label className="block text-sm font-medium mb-1">Features</label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border-2 border-black rounded-lg"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="px-3 py-2 bg-white border-2 border-black rounded-r-full rounded-b-full
             text-black hover:bg-red-400 transition-all
             shadow-[4px_4px_0_0_rgba(239,68,68)] "
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="mt-2 px-4 py-2 bg- border-2 border-black hover:bg-green-300 transition-colors shadow-[4px_4px_0px_0px_rgba(34,197,94,0.5)]"
              >
                + Add Feature
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3  border-2 border-black font-semibold hover:bg-blue-300 transition-colors shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]"
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
            {formData.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {formData.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
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
