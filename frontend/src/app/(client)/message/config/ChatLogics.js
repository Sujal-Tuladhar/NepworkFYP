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

export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== m.sender._id ||
      messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};
export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id !== undefined
  );
};

export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};
