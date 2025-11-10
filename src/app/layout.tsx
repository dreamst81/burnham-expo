import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Burnham Expo",
  description: "Event Intelligence Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-[#f9fafb] text-gray-800">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </body>
    </html>
  );
}