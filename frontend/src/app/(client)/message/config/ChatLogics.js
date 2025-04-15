export const getSender = (currentUser, users) => {
  if (!currentUser || !users) return ""; // handle undefined cases

  return users[0]?._id === currentUser._id
    ? users[1]?.username
    : users[0]?.username;
};

export const getSenderFull = (currentUser, users) => {
  if (!currentUser || !users) return null; // handle undefined cases

  return users[0]?._id === currentUser._id ? users[1] : users[0];
};
