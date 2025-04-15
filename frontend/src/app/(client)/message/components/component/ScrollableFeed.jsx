"use client";
import { useRef, useEffect } from "react";

export default function ScrollableFeed({ children }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  // Improved scroll behavior
  useEffect(() => {
    const container = containerRef.current;
    const isNearBottom =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + 100;

    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [children]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 transition-colors duration-300 bg-gray-50"
    >
      <div className="flex flex-col gap-2 p-4">
        {children}
        <div ref={bottomRef} className="h-px" />
      </div>
    </div>
  );
}
