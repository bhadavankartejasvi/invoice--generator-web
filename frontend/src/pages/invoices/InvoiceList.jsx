import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import { getInvoices } from "../../api/invoices";
import { toast } from "react-hot-toast";

const InvoiceList = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");

  const loadInvoices = async (query = "") => {
    try {
      const data = await getInvoices(query);
      setInvoices(data);
    } catch {
      toast.error("Failed to load invoices");
      setInvoices([]);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadInvoices(search);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const exportToCSV = () => {
    if (!invoices || invoices.length === 0) return toast.error("No invoices to export");
    const headers = ["Invoice Number", "Client Name", "Due Date", "Total", "Status"];
    const rows = invoices.map(inv => [
      inv.number || inv.invoice_number || "INV-000",
      inv.Client?.name || inv.client?.name || inv.clientName || "—",
      inv.dueDate || inv.createdAt ? new Date(inv.dueDate || inv.createdAt).toLocaleDateString() : "—",
      (inv.total_amount || inv.total || 0).toFixed(2),
      inv.status || "Draft"
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "invoices.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("CSV exported successfully");
  };

  const calculateStats = () => {
    let revenue = 0;
    let outstanding = 0;
    let outstandingCount = 0;
    let overdue = 0;
    let overdueCount = 0;
    let drafts = 0;

    invoices.forEach(inv => {
      const amount = Number(inv.total_amount || inv.total || 0);
      const status = (inv.status || "").toLowerCase();
      
      if (status === 'paid') revenue += amount;
      if (status === 'pending' || status === 'finalised') {
        outstanding += amount;
        outstandingCount++;
      }
      if (status === 'overdue') {
        overdue += amount;
        overdueCount++;
      }
      if (status === 'draft') drafts++;
    });

    return [
      { label: "Total Revenue", value: `$${revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`, badge: "+12.5%", color: "text-emerald-600", bg: "bg-emerald-50", icon: "svg-revenue" },
      { label: "Outstanding", value: `$${outstanding.toLocaleString(undefined, {minimumFractionDigits: 2})}`, subtext: `${outstandingCount} invoices pending`, icon: "svg-outstanding" },
      { label: "Overdue", value: `$${overdue.toLocaleString(undefined, {minimumFractionDigits: 2})}`, subtext: `${overdueCount} critical alerts`, text: "text-rose-600", icon: "svg-overdue" },
      { label: "Drafts", value: drafts.toString(), subtext: "Ready to send", icon: "svg-drafts" }
    ];
  };

  const cards = calculateStats();

  const renderIcon = (name) => {
    switch(name) {
      case "svg-revenue": return <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
      case "svg-outstanding": return <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
      case "svg-overdue": return <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>;
      case "svg-drafts": return <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Invoices</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your billing history and track payment status across all clients.</p>
        </div>
        <button onClick={() => navigate("/app/invoices/create")} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-sm transition-colors hover:bg-slate-800 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Create New Invoice
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, i) => (
          <Card key={i} className="flex flex-col justify-center">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg || 'bg-slate-50'}`}>
                {renderIcon(card.icon)}
              </div>
            </div>
            <p className={`text-2xl font-bold tracking-tight ${card.text || 'text-slate-900'}`}>{card.value}</p>
            {card.badge && (
              <span className={`inline-flex items-center text-[10px] font-bold mt-2 ${card.color}`}>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                {card.badge}
              </span>
            )}
            {card.subtext && (
              <p className="text-[11px] font-medium text-slate-500 mt-2">{card.subtext}</p>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4 mr-4">
            <div className="relative w-full max-w-md">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </span>
              <input 
                type="text" 
                placeholder="Search by invoice number or client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <button onClick={exportToCSV} className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 hover:text-slate-900">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <Table
            columns={[
              { key: "invoiceNumber", label: "Invoice ID", render: (inv) => <span className="font-semibold text-slate-900">{inv.invoiceNumber}</span> },
              { key: "clientName", label: "Client", render: (inv) => (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                    {inv.clientName.substring(0,2).toUpperCase()}
                  </div>
                  <span className="font-semibold text-slate-700">{inv.clientName}</span>
                </div>
              ) },
              { key: "dueDate", label: "Date" },
              { key: "total", label: "Amount", render: (inv) => <span className="font-bold text-slate-900">{inv.total}</span> },
              { key: "status", label: "Status", render: (inv) => {
                const isPaid = inv.status.toLowerCase() === 'paid';
                const isDraft = inv.status.toLowerCase() === 'draft';
                const isOverdue = inv.status.toLowerCase() === 'overdue' || inv.status.toLowerCase() === 'cancelled';
                
                return (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                    ${isPaid ? 'bg-emerald-50 text-emerald-600' : 
                      isDraft ? 'bg-slate-100 text-slate-600' : 
                      isOverdue ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                    {inv.status}
                  </span>
                )
              }},
              { key: "actions", label: "Actions", render: (invoice) => (
                <button onClick={() => navigate(`/app/invoices/${invoice.id || invoice._id}`)} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">
                  View
                </button>
              )}
            ]}
            data={invoices.map((invoice) => ({
              id: invoice.id || invoice._id,
              invoiceNumber: invoice.invoice_number || invoice.number || "INV-000",
              clientName: invoice.Client?.name || invoice.client?.name || invoice.clientName || "—",
              dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : "—",
              total: invoice.total_amount ? `$${invoice.total_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}` : "—",
              status: invoice.status || "Pending"
            }))}
          />
        </div>
      </Card>
    </div>
  );
};

export default InvoiceList;
