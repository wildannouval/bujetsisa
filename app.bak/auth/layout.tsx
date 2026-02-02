// app/auth/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-[#020617] flex items-center justify-center p-6 overflow-hidden transition-colors duration-500">
      {/* 0. NEBULA BACKLIGHTS (Elemen kunci agar efek kaca terlihat) */}
      <div className="absolute top-[-10%] left-[-10%] size-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] size-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* GRAINY NOISE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* CONTENT LAYER */}
      <div className="relative z-10 w-full flex justify-center">{children}</div>
    </div>
  );
}
