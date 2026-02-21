interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function AppLayout({ children, className = "" }: AppLayoutProps) {
  return (
    <div className={`min-h-screen bg-[#0B0E11] text-white ${className}`}>
      {/* Background pattern */}
      <div
        className="fixed inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, #181A20 1px, transparent 1px),
            linear-gradient(to bottom, #181A20 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
      {/* Gradient glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#7F00FF] rounded-full mix-blend-normal filter blur-[128px] opacity-20 -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#7F00FF] rounded-full mix-blend-normal filter blur-[128px] opacity-10 -z-10" />
      {children}
    </div>
  );
}
