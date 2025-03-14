"use client";

import dynamic from "next/dynamic";

const Hoppers = dynamic(() => import("./components/Hoppers"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col p-4">
      <Hoppers />
    </main>
  );
}
