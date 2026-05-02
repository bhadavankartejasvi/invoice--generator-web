const Card = ({ title, subtitle, className = "", children }) => {
  return (
    <section className={`bg-white rounded-xl border border-slate-200 shadow-sm p-6 ${className}`}>
      {(title || subtitle) && (
        <header className="mb-6 flex flex-col gap-1.5">
          {title && <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>}
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
};

export default Card;
