"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

const Review = ({ review, onDelete }) => {
  const { user: currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!review) return null;

  const handleDelete = async () => {
    try {
      if (!currentUser || currentUser._id !== review.userId._id) {
        toast.error("You can only delete your own reviews");
        return;
      }

      setIsDeleting(true);
      await onDelete(review._id);
      setOpen(false);
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const reviewAuthor = review.userId || {};

  return (
    <div
      className="p-4 border-2 border-black rounded-tl-3xl shadow-[4px_0px_0px_0px_rgba(129,197,255,1),0px_-4px_0px_0px_rgba(129,197,255,1)]

 "
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <img
            src={reviewAuthor?.profilePic || "/images/icons/NoAvatar.svg"}
            alt={reviewAuthor?.username || "User"}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="flex gap-5">
              <span className="font-medium">
                {reviewAuthor?.username || "Anonymous"}
              </span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`${
                      i < review.star ? "text-yellow-500" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              {reviewAuthor?.country || "Unknown location"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>

          {currentUser && currentUser._id === review.userId._id && (
            <Dialog.Root open={open} onOpenChange={setOpen}>
              <Dialog.Trigger asChild>
                <button
                  className="text-red-500 hover:text-red-700 border-2 border-black  p-2 shadow-[4px_4px_0px_0px_rgba(255,99,132,0.5)]"
                  aria-label="Delete review"
                >
                  Delete
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="bg-black/50 fixed inset-0" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                  <Dialog.Title className="text-lg font-semibold mb-4">
                    Confirm Deletion
                  </Dialog.Title>
                  <Dialog.Description className="mb-6">
                    Are you sure you want to delete this review? This action
                    cannot be undone.
                  </Dialog.Description>
                  <div className="flex justify-end gap-4">
                    <Dialog.Close asChild>
                      <button
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                        disabled={isDeleting}
                      >
                        Cancel
                      </button>
                    </Dialog.Close>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded disabled:opacity-50"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                  <Dialog.Close asChild>
                    <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                      <Cross2Icon />
                    </button>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          )}
        </div>
      </div>
      <p className="text-gray-700">{review.desc}</p>
    </div>
  );
};

export default Review;
