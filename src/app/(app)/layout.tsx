import Navigation from '@/components/ui/Navigation';
import GatorChat from '@/components/chatbot/GatorChat';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="pt-16 min-h-screen bg-[#0a0f1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <GatorChat />
    </>
  );
}
