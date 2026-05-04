"use client";
import { useState } from "react";

export const useToggle = (initialState = false) => {
  const [isToggled, setIsToggled] = useState(initialState);

  const toggle = () => setIsToggled((prev) => !prev);

  return { isToggled, setIsToggled, toggle, setTruthy: () => setIsToggled(true), setFalsy: () => setIsToggled(false) };
};
