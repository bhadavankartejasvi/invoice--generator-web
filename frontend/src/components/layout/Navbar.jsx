import { useNavigate } from "react-router-dom";

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  return (
    <div className="h-[72px] bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden text-slate-500 hover:text-slate-900 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <div className="w-full max-w-[480px] hidden sm:block">
          {/* Search removed as requested */}
        </div>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-6 ml-auto">
        <div className="flex items-center gap-4 hidden">
          {/* Notifications removed */}
        </div>
        
        <div className="flex items-center gap-3 border-l border-slate-200 pl-6 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/app/profile")}>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-none">Alexander Vogel</p>
            <p className="text-xs text-slate-500 mt-1">Head of Finance</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-200 overflow-hidden shrink-0">
            <img src="https://ui-avatars.com/api/?name=Alexander+Vogel&background=random" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
