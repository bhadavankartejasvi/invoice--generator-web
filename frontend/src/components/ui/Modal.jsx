const Modal = ({ open, title, description, onClose, children, footer }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm animate-fade-in-up">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
            {description && <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">{description}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-colors">✕</button>
        </div>
        <div className="space-y-5 px-6 py-5">{children}</div>
        {footer && <div className="border-t border-slate-100 px-6 py-4 bg-slate-50">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
