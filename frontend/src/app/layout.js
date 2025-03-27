"use client";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import NavBar from "./components/NavBar";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function RootLayout({ children }) {
  useEffect(() => {
    const updateFavicon = () => {
      const darkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const favicon = document.querySelector("link[rel='icon']");
      if (favicon) {
        favicon.href = darkMode ? "whiteLogo.svg" : "/darkLogo.png";
      }
    };

    updateFavicon(); // Set favicon on initial load
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", updateFavicon);

    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", updateFavicon);
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Nepwork</title>
        <link rel="icon" href="/darkLogo.png" sizes="48x48" />
      </head>

      <body className={`${notoSans.variable} antialiased`}>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
