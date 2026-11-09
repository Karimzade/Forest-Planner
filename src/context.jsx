import { createContext, useContext } from "react";
export const PlannerContext = createContext(null);
export const usePlanner = () => useContext(PlannerContext);
export const categories = ["یادگیری", "کار", "سلامتی", "شخصی"];
export const statusNames = {
  pending: "در انتظار",
  done: "انجام‌شده",
  missed: "انجام‌نشده",
};
