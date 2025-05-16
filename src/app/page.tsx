import ChatBot from '../components/ChatBot';

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full">
          <ChatBot />
        </div>
      </main>
    </div>
  );
}
