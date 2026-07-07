import { useContext } from "react";

import { UserContext } from "../utils/UserContext";

/** true, пока идёт первичная загрузка сессии. Нужно, чтобы админка не редиректила «не залогинен» раньше времени. */
export const useUserLoading = (): boolean => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserLoading must be used within a UserProvider");
  }
  return context.isLoading;
};
