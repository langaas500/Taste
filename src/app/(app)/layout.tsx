import Nav from "@/components/Nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-dvh">
      <Nav />
      <main className="flex-1 pt-11 pb-16 md:pt-0 md:pb-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 md:px-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
