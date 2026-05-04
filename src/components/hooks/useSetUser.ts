import { useContext } from "react";

import type { UserContextType } from "../utils/UserContext";
import { UserContext } from "../utils/UserContext";

export const useSetUser = (): UserContextType["setUser"] => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useSetUser must be used within a UserProvider");
  }
  const { setUser } = context;
  return setUser;
};
