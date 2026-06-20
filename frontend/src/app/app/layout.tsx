import Script from 'next/script';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <div className="min-h-screen bg-slate-950 text-white">
        {children}
      </div>
    </>
  );
}
