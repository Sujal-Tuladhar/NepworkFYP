"use client";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import NavBar from "./components/NavBar";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function RootLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Retrieve token from localStorage or cookies
    const token = localStorage.getItem("currentUser"); // If using cookies, use `document.cookie`

    // Redirect if user is logged in and tries to access login/register
    if (token && (pathname === "/login" || pathname === "/register")) {
      router.push("/");
    }
  }, [pathname]); // Runs when pathname changes

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

    updateFavicon();
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
        <AuthProvider>
          <ChatProvider>
            <NavBar />
            {children}
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
