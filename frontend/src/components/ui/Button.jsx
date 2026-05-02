const variantClasses = {
  primary: "bg-slate-900 hover:bg-slate-800 text-white shadow-sm",
  secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
  danger: "bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 shadow-sm"
};

const Button = ({ children, className = "", variant = "primary", ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-[14px] font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
