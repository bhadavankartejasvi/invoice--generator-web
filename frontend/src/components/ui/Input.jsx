// const Input = ({ label, className = "", ...props }) => {
//   return (
//     <div className={`space-y-1.5 ${className}`}>
//       {label && <label className="block text-[13px] font-semibold text-slate-700 uppercase tracking-wide">{label}</label>}
//       <input
//         className="w-full bg-gr-50 border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
//         {...props}
//       />
//     </div>
//   );
// };

// export default Input;
const Input = ({ label, className = "", ...props }) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-[13px] font-semibold text-slate-700 uppercase tracking-wide">
          {label}
        </label>
      )}

      <input
        className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
        {...props}
      />
    </div>
  );
};

export default Input;