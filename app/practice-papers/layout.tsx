import Navbar from "@/components/Navbar";
import { ReactNode } from "react";

export default function PracticePapersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern dark:bg-gray-900">
      <Navbar />
      {children}
    </div>
  );
}
