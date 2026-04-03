import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Believers",
};

export default function BelieversLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
