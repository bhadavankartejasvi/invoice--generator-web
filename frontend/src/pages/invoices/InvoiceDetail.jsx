import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getInvoiceById, updateStatus, downloadInvoicePDF, sendInvoiceEmail, deleteInvoice } from "../../api/invoices";

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState("");
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [emailing, setEmailing] = useState(false);

  const loadInvoice = async () => {
    try {
      const data = await getInvoiceById(id);
      setInvoice(data);
    } catch {
      setError("Failed to load invoice details.");
      toast.error("Failed to load invoice details.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateStatus(id, newStatus);
      toast.success(`Invoice marked as ${newStatus}`);
      loadInvoice();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleDownload = async () => {
    try {
      setLoadingPdf(true);
      toast.loading("Generating PDF...", { id: 'pdf' });
      await downloadInvoicePDF(id);
      toast.success("Download started", { id: 'pdf' });
    } catch {
      toast.error("Failed to download PDF", { id: 'pdf' });
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleEmail = async () => {
    const clientEmail = invoice?.Client?.email || "";
    const email = window.prompt("Enter email to send invoice to:", clientEmail);
    if (!email) return;

    try {
      setEmailing(true);
      toast.loading("Sending email...", { id: 'email' });
      await sendInvoiceEmail(id, email);
      toast.success("Email sent successfully!", { id: 'email' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send email", { id: 'email' });
    } finally {
      setEmailing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this invoice? This cannot be undone.")) return;
    try {
      await deleteInvoice(id);
      toast.success("Invoice deleted successfully");
      navigate("/app/invoices");
    } catch {
      toast.error("Failed to delete invoice");
    }
  };

  if (error) return <div className="p-8 text-center text-rose-500">{error}</div>;
  if (!invoice) return <div className="p-20 flex justify-center"><div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;

  const items = invoice.InvoiceItems || invoice.items || [];
  const client = invoice.Client || {};
  let tplConfig = invoice.template_snapshot || {};
  while (typeof tplConfig === 'string') {
    try { tplConfig = JSON.parse(tplConfig); } catch { break; }
  }

  if (tplConfig && typeof tplConfig === "object" && tplConfig["0"] === "{") {
    const str = Object.keys(tplConfig)
      .filter(k => !isNaN(parseInt(k)))
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(k => tplConfig[k])
      .join("");
    try {
      const parsed = JSON.parse(str);
      tplConfig = { ...parsed, ...tplConfig };
    } catch {
      console.error("Failed to parse reconstructed config");
    }
  }
  const themeColor = tplConfig.themeColor || '#1e293b';
  const fontClass = tplConfig.typography === 'serif' ? 'font-serif' : tplConfig.typography === 'mono' ? 'font-mono' : 'font-sans';
  const radiusClass = tplConfig.borderStyle === 'square' ? 'rounded-none' : 'rounded-lg';

  return (
    <div className={`max-w-[1200px] mx-auto pb-12 animate-fade-in-up ${fontClass}`}>
      {/* Breadcrumbs & Status */}
      <div className="flex items-center gap-3 mb-6 text-sm">
        <button onClick={() => navigate("/app/invoices")} className="text-slate-400 hover:text-slate-600 transition-colors">Invoices</button>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-800">{invoice.invoice_number || invoice.number || "INV"}</span>
        
        <div className="ml-4 flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider
            ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
              invoice.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                invoice.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                  'bg-blue-100 text-blue-700'}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 
              ${invoice.status === 'paid' ? 'bg-emerald-500' :
                invoice.status === 'draft' ? 'bg-slate-400' :
                  invoice.status === 'cancelled' ? 'bg-rose-500' :
                    'bg-blue-500'}`}></span>
            {invoice.status || 'DRAFT'}
          </span>
          <span className="text-slate-400 text-xs">Sent on {new Date(invoice.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: The Invoice Paper */}
        <div className={`flex-1 bg-white border border-slate-200 shadow-sm p-12 w-full min-h-[800px] ${radiusClass}`}>
          {/* Header */}
          <div className="flex justify-between items-start mb-16">
            <div>
              <h1 className="text-4xl font-bold tracking-tight" style={{ color: themeColor }}>INVOICE</h1>
              <p className="text-sm text-slate-500 mt-1">{invoice.invoice_number || invoice.number || "INV"}</p>
            </div>
            <div className="text-right">
              {tplConfig.logoUrl ? (
                <img src={tplConfig.logoUrl} alt="Logo" className="h-12 object-contain ml-auto mb-4" />
              ) : (
                <div className="w-12 h-12 rounded flex items-center justify-center ml-auto mb-4" style={{ backgroundColor: themeColor }}>
                  <span className="text-white font-bold text-lg">FP</span>
                </div>
              )}
              <h2 className="font-bold text-slate-900 text-sm">FinPrecision Corp</h2>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                742 Avenue of the Americas<br/>
                New York, NY 10010<br/>
                billing@finprecision.com
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-8 mb-12">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: themeColor }}>Bill To</p>
              <h3 className="font-bold text-slate-900 text-sm">{client.company || client.name || "Client Name"}</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Attn: {client.name}<br/>
                {client.email}<br/>
                {client.phone}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: themeColor }}>Invoice Date</p>
              <p className="font-semibold text-slate-900 text-sm">{new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: themeColor }}>Due Date</p>
              <p className="font-semibold text-slate-900 text-sm">{new Date(invoice.dueDate || invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-12 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b-2" style={{ borderColor: themeColor }}>
                  <th className="py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: themeColor }}>Description</th>
                  <th className="py-3 text-[10px] font-bold uppercase tracking-wider text-right w-20" style={{ color: themeColor }}>Qty</th>
                  <th className="py-3 text-[10px] font-bold uppercase tracking-wider text-right w-32" style={{ color: themeColor }}>Price</th>
                  <th className="py-3 text-[10px] font-bold uppercase tracking-wider text-right w-32" style={{ color: themeColor }}>Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-slate-900 text-sm">{item.description}</p>
                    </td>
                    <td className="py-4 text-right text-sm text-slate-600 font-medium">{item.quantity}</td>
                    <td className="py-4 text-right text-sm text-slate-600 font-medium">${Number(item.unit_price || item.price || 0).toFixed(2)}</td>
                    <td className="py-4 text-right text-sm font-bold text-slate-900">${(Number(item.quantity) * Number(item.unit_price || item.price || 0)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-16">
            <div className="w-72">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-slate-900 font-medium">${Number(invoice.subtotal || invoice.total_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm border-b border-slate-200">
                <span className="text-slate-500 font-medium">Tax</span>
                <span className="text-slate-900 font-medium">${Number(invoice.tax_amount || invoice.tax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-4">
                <span className="font-bold uppercase tracking-wide" style={{ color: themeColor }}>Grand Total</span>
                <span className="font-bold text-slate-900 text-lg">${Number(invoice.total_amount || invoice.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {tplConfig.signatureUrl && (
            <div className="mb-12 flex justify-end">
              <div className="text-center">
                <img src={tplConfig.signatureUrl} alt="Signature" className="h-16 object-contain mb-2 border-b border-slate-300 pb-2" />
                <p className="text-xs text-slate-500 uppercase tracking-wider">Authorized Signature</p>
              </div>
            </div>
          )}

          {/* Footer Notes */}
          <div className="pt-8 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: themeColor }}>Notes</p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              {invoice.notes || tplConfig.defaultNotes || "Please include the invoice number in your wire transfer description. Payments are due within 30 days of invoice receipt. Late payments are subject to a 2% monthly interest fee."}
            </p>
          </div>
        </div>

        {/* Right: Sidebar Widgets */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          
          {/* Actions Widget */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Actions</h3>
            <div className="space-y-3">
              <button onClick={handleDownload} disabled={loadingPdf} className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                {loadingPdf ? "Downloading..." : "Download PDF"}
              </button>
              <button onClick={handleEmail} disabled={emailing} className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                {emailing ? "Sending..." : "Send Email"}
              </button>
              
              {(!invoice.status || invoice.status === 'draft') && (
                <button onClick={() => handleStatusChange("finalised")} className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm py-2.5 rounded-lg transition-colors">
                  Mark as Finalised
                </button>
              )}
              
              {invoice.status === 'finalised' && (
                <button onClick={() => handleStatusChange("paid")} className="w-full flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 border border-slate-200 text-emerald-600 font-semibold text-sm py-2.5 rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Mark as Paid
                </button>
              )}
              
              {invoice.status !== 'cancelled' && (
                <button onClick={() => handleStatusChange("cancelled")} className="w-full flex items-center justify-center gap-2 bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 font-semibold text-sm py-2.5 rounded-lg transition-colors mt-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Void Invoice
                </button>
              )}

              <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-sm py-2.5 rounded-lg transition-colors mt-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Delete Invoice
              </button>
            </div>
          </div>

          {/* Audit Log Widget */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h3 className="font-bold text-slate-900 text-sm mb-6">Audit Log</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[9px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {/* Mock Timeline Items */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-emerald-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 z-10 -translate-x-1/2"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-2rem)] pl-6 md:pl-0">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-xs">Invoice Marked as Paid</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">by Alexander Vogel</span>
                    <span className="text-[9px] text-slate-400 font-medium mt-1 uppercase">Oct 14, 2023 - 02:30 PM</span>
                  </div>
                </div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-blue-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 z-10 -translate-x-1/2"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-2rem)] pl-6 md:pl-0">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-xs">Email Sent to Client</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 max-w-[150px] truncate">Sent to {client.email}</span>
                    <span className="text-[9px] text-slate-400 font-medium mt-1 uppercase">Oct 12, 2023 - 11:15 AM</span>
                  </div>
                </div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 z-10 -translate-x-1/2"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-2rem)] pl-6 md:pl-0">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-xs">Invoice Created</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Draft version generated</span>
                    <span className="text-[9px] text-slate-400 font-medium mt-1 uppercase">Oct 11, 2023 - 10:05 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Client Rep Widget */}
          <div className="bg-[#1e2330] rounded-xl p-6 text-white shadow-lg">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Client Representative</p>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden shrink-0 border border-slate-600">
                <img src={`https://ui-avatars.com/api/?name=${client.name || 'Client'}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">{client.name || "Sarah Jenkins"}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Lead Procurement Manager</p>
              </div>
            </div>
            
            <div className="space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                {client.email || "sarah.j@globalsynergies.com"}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                {client.phone || "+44 20 7946 0123"}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
