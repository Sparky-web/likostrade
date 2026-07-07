"use client";

import type { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { createContext, type PropsWithChildren, useState } from "react";

import { useMountEffect } from "../hooks/useMountEffect";

export type UserContextType = {
  user: Session["user"] | undefined;
  setUser: (user: Session["user"]) => void;
  /** true, пока идёт первичная загрузка сессии; отличает «не залогинен» от «ещё не знаем». */
  isLoading: boolean;
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

  // Раньше здесь было `{!isLoading && children}` — это прятало ВЕСЬ сайт до ответа getSession()
  // и на сервере (isLoading всегда true) отдавало пустой HTML. Теперь публичный контент рендерится
  // серверно; знание о загрузке сессии нужно только админке — она гейтит себя через isLoading.
  return <UserContext.Provider value={{ user, setUser, isLoading }}>{children}</UserContext.Provider>;
};
