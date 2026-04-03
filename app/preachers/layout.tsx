import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preachers",
};

export default function PreachersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
