// ... existing code ...
import { useChat } from "@/app/context/ChatContext";

const NavBar = () => {
  const { notification } = useChat();
  // ... existing code ...

  return (
    <nav className="bg-white shadow-lg">
      {/* ... existing code ... */}
      <div className="flex items-center space-x-4">
        <Link href="/message" className="relative">
          <MessageIcon className="h-6 w-6" />
          {notification.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notification.length}
            </span>
          )}
        </Link>
        {/* ... existing code ... */}
      </div>
      {/* ... existing code ... */}
    </nav>
  );
};
// ... existing code ...
