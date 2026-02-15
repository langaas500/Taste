import Nav from "@/components/Nav";
import Image from "next/image";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-dvh">
      <Nav />
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-5 md:px-6 md:py-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Taste"
              width={180}
              height={80}
              priority
              className="object-contain"
            />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
