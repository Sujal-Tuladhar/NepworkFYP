export const getSender = (loggedUser, users) => {
  return users[0]?._id === loggedUser?._id
    ? users[0].username
    : users[1].username;
};


export const getSenderFull = (loggedUser, users) => {
  return users[0]?._id === loggedUser?._id ? users[1] : users[0];
}

