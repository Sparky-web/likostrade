import { useContext } from "react";

import { UserContext, type UserContextType } from "../utils/UserContext";

export const useUser = (): UserContextType["user"] => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  const { user } = context;

  return user;
};
