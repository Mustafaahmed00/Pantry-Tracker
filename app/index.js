// pages/index.js
import Head from 'next/head';

export default function HomePage() {
  return (
    <div>
      <Head>
        <title>Pantry Tracker</title>
        <meta name="description" content="Track and manage your pantry items efficiently" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-4">Welcome to Pantry Tracker</h1>
        <p className="text-lg mb-6">Start managing your pantry items efficiently.</p>

        {/* Add your main content or components here */}
      </main>
    </div>
  );
}
