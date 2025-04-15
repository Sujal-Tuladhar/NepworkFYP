"use client";

import animationData from "../../animations/typing.json";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("react-lottie"), {
  ssr: false,
  loading: () => <div style={{ width: 70, height: 40 }} />, // Add loading placeholder
});

const TypingAnimation = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div>
      <Lottie
        options={defaultOptions}
        width={70}
        style={{ marginBottom: 15, marginLeft: 0 }}
      />
    </div>
  );
};

export default TypingAnimation;
