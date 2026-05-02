const AuthFooter = () => {
  return (
    <footer className="mt-8 w-full max-w-md rounded-[28px] glass-card p-6 text-sm shadow-[0_24px_50px_rgba(0,0,0,0.3)] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-slate-400 font-medium tracking-wide text-xs">Secure workflows for your business data.</p>
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold tracking-widest uppercase">
          <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-indigo-300">Secure</span>
          <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-indigo-300">Analytics</span>
        </div>
      </div>
    </footer>
  );
};

export default AuthFooter;