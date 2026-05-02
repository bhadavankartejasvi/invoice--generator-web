const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen p-4 flex items-center justify-center relative bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center relative z-10">
        <div className="w-full flex flex-col items-center">
          {children}
        </div>
      </div>
      
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
    </div>
  );
};

export default AuthLayout;