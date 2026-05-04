"use client";

import type { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { createContext, type PropsWithChildren, useState } from "react";

import { useMountEffect } from "../hooks/useMountEffect";

export type UserContextType = {
  user: Session["user"] | undefined;
  setUser: (user: Session["user"]) => void;
};

export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<Session["user"]>();

  useMountEffect(() => {
    getSession()
      .then((session) => {
        if (session?.user) {
          setUser(session?.user);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  });

  return <UserContext.Provider value={{ user, setUser }}>{!isLoading && children}</UserContext.Provider>;
};
