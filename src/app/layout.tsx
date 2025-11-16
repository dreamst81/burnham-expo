import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";

export const metadata = {
  title: "Burnham Expo",
  description: "Event intelligence for Modern Warfare Week",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex bg-[#fafafa]">
        <Sidebar />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-h-screen relative pt-14 lg:pt-6 lg:pl-64 px-4">
          
          {/* 🔥 Burnham Logo (Top Right Global Header) */}
          <div className="hidden lg:block fixed bottom-4 right-6 z-20">
            <a href="/">
              <Image
                src="/burnham-expo-logo.jpg"
                alt="Burnham Expo Logo"
                width={160}
                height={50}
                className="object-contain opacity-90 hover:opacity-100 transition"
              />
            </a>
          </div>

          {/* 🔥 Mobile header logo (inside the drawer header area) */}
          <div className="lg:hidden flex justify-end pr-3 pb-2 fixed bottom-4 right-6 z-20">
            <a href="/">
              <Image
                src="/burnham-expo-logo.jpg"
                alt="Burnham Expo Logo"
                width={110}
                height={40}
                className="object-contain opacity-90 hover:opacity-100 transition"
              />
            </a>
          </div>

          {children}
        </main>
      </body>
    </html>
  );
}