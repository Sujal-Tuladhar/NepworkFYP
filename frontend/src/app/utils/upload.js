import axios from "axios";

const upload = async (file) => {
  if (!file) {
    console.error("No file provided for upload");
    return null;
  }

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "finalproject"); // Ensure this matches your Cloudinary preset

  try {
    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/dx6rq6eiw/image/upload",
      data
    );

    console.log("Cloudinary Response:", res.data);
    return res.data.secure_url;
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    return null;
  }
};
export default upload;
