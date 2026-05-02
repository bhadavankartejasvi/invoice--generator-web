import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import { getClients } from "../../api/clients";
import { getProducts } from "../../api/products";
import { getInvoices } from "../../api/invoices";
import { toast } from "react-hot-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    outstanding: 0,
    outstandingCount: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clients, products, invoices] = await Promise.all([getClients(), getProducts(), getInvoices()]);
        
        let revenue = 0;
        let pending = 0;
        let pendingCount = 0;

        invoices.forEach(inv => {
          const amount = Number(inv.total_amount || inv.total || 0);
          const status = (inv.status || "").toLowerCase();
          if (status === 'paid') {
            revenue += amount;
          } else if (status === 'pending' || status === 'finalised' || status === 'overdue') {
            pending += amount;
            pendingCount++;
          }
        });

        const expenses = revenue * 0.3; // Mocking 30% expenses for chart
        const profit = revenue - expenses;

        setStats({
          totalRevenue: revenue,
          totalExpenses: expenses,
          netProfit: profit,
          outstanding: pending,
          outstandingCount: pendingCount
        });
        
        setRecentInvoices(invoices.slice(0, 5));
      } catch {
        toast.error("Failed to load dashboard data");
      }
    };

    loadData();
  }, []);

  const cards = [
    { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`, badge: "+12.5%", color: "text-emerald-600", bg: "bg-blue-50", icon: "svg-revenue" },
    { label: "Total Expenses", value: `$${stats.totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}`, badge: "+4.2%", color: "text-rose-600", bg: "bg-rose-50", icon: "svg-expenses" },
    { label: "Net Profit", value: `$${stats.netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}`, badge: "+19.1%", color: "text-emerald-600", bg: "bg-emerald-50", icon: "svg-profit" },
    { label: "Outstanding", value: `$${stats.outstanding.toLocaleString(undefined, {minimumFractionDigits: 2})}`, subtext: `${stats.outstandingCount} Invoices`, icon: "svg-outstanding" }
  ];

  const renderIcon = (name) => {
    switch(name) {
      case "svg-revenue": return <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
      case "svg-expenses": return <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;
      case "svg-profit": return <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>;
      case "svg-outstanding": return <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Reports</h2>
          <p className="text-sm text-slate-500 mt-1">Analyze your enterprise performance and cash flow.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-sm transition-colors hover:bg-slate-50 shadow-sm">
            Jan 1, 2024 - Dec 31, 2024
          </button>
          <button onClick={() => navigate("/app/invoices/create")} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-sm transition-colors hover:bg-slate-50 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Export
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, i) => (
          <Card key={i} className="flex flex-col justify-center">
            <div className="flex justify-between items-start mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg || 'bg-slate-50'}`}>
                {renderIcon(card.icon)}
              </div>
              {card.badge && (
                <span className={`inline-flex items-center text-[10px] font-bold ${card.color}`}>
                  <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                  {card.badge}
                </span>
              )}
              {card.subtext && (
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{card.subtext}</span>
              )}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold tracking-tight ${card.text || 'text-slate-900'}`}>{card.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900">Revenue vs. Expenses</h3>
              <p className="text-xs text-slate-500">Monthly trajectory of operational cash flow</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-900"></span> Revenue</span>
              <span className="flex items-center gap-1 text-slate-500"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Expenses</span>
            </div>
          </div>
          {/* Abstract Chart Graphic */}
          <div className="flex-1 w-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center opacity-60">
            <span className="text-slate-400 font-medium">Chart Visualization</span>
          </div>
        </Card>

        <Card className="p-6 flex flex-col min-h-[300px]">
          <h3 className="font-bold text-slate-900">Client Distribution</h3>
          <p className="text-xs text-slate-500 mb-6">Revenue share by industry vertical</p>
          
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="w-32 h-32 rounded-full border-[12px] border-slate-900 border-r-slate-300 border-b-slate-100 flex items-center justify-center mb-8 shadow-sm">
               <span className="font-bold text-slate-900">$1.4M</span>
            </div>
            <div className="w-full space-y-2 text-xs">
               <div className="flex justify-between"><span className="font-bold text-slate-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-900"></span> Technology</span><span className="font-medium text-slate-500">45%</span></div>
               <div className="flex justify-between"><span className="font-bold text-slate-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Manufacturing</span><span className="font-medium text-slate-500">25%</span></div>
               <div className="flex justify-between"><span className="font-bold text-slate-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-100"></span> Financial Svcs</span><span className="font-medium text-slate-500">30%</span></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
