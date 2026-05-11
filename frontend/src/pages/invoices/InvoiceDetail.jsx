import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getInvoiceById, updateStatus, downloadInvoicePDF, sendInvoiceEmail, deleteInvoice } from "../../api/invoices";
import { displayCurrency } from "../../utils/currency";
import { formatDateISO } from "../../utils/date";

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
  const rawClient = invoice.Client || invoice.client || {};
  const client = {
    company: rawClient.company || invoice.customer_name || invoice.clientName || rawClient.name,
    name: rawClient.name || invoice.customer_name || invoice.clientName,
    email: rawClient.email || invoice.customer_email,
    phone: rawClient.phone || invoice.customer_phone,
    address: rawClient.address || invoice.billing_address || invoice.shipping_address || "",
  };
  const clientAddressLines = client.address ? client.address.split("\n").filter(Boolean) : [];
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
  const fontClass = tplConfig.typography === 'Merriweather' ? 'font-serif' : 
                   tplConfig.typography === 'Mono' ? 'font-mono' : 
                   'font-sans';
  const radiusClass = tplConfig.borderStyle === 'Sharp' ? 'rounded-none' : 
                     tplConfig.borderStyle === 'Soft' ? 'rounded-lg shadow-lg' : 
                     'rounded-lg';
  const disabledFields = tplConfig.disabledFields || [];
  const hasAnyTax = items.some(item => Number(item.tax_rate || 0) > 0);
  const hasAnyDiscount = items.some(item => Number(item.discount || 0) > 0) || Number(invoice.discount_amount || 0) > 0;
  const showInvoiceNumber = !disabledFields.includes("invoiceNumber");
  const showDueDate = !disabledFields.includes("dueDate");
  const showTax = !disabledFields.includes("tax") || hasAnyTax;
  const showDiscount = !disabledFields.includes("discount") || hasAnyDiscount;
  const showNotes = !disabledFields.includes("notes");

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
          <span className="text-slate-400 text-xs">Sent on {formatDateISO(invoice.createdAt)}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: The Invoice Paper */}
        <div className={`flex-1 bg-white border border-slate-200 shadow-sm p-12 w-full min-h-[800px] ${radiusClass}`}>
          {/* Header */}
          <div className="flex justify-between items-start mb-16">
            <div>
              <h1 className="text-4xl font-bold tracking-tight" style={{ color: themeColor }}>INVOICE</h1>
              {showInvoiceNumber && <p className="text-sm text-slate-500 mt-1">{invoice.invoice_number || invoice.number || "INV"}</p>}
            </div>
            <div className="text-right">
              {tplConfig.logoUrl ? (
                <img src={tplConfig.logoUrl} alt="Logo" className="h-12 object-contain ml-auto mb-4" />
              ) : (
                <div className="w-12 h-12 rounded flex items-center justify-center ml-auto mb-4" style={{ backgroundColor: themeColor }}>
                  <span className="text-white font-bold text-lg">{(tplConfig.businessName || 'FP').substring(0, 2).toUpperCase()}</span>
                </div>
              )}
              <h2 className="font-bold text-slate-900 text-sm">{tplConfig.businessName || 'Business Name'}</h2>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed whitespace-pre-wrap">
                {tplConfig.businessAddress || '123 Business Address\nCity, State 12345\nemail@business.com'}
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className={`${showDueDate ? 'grid-cols-3' : 'grid-cols-2'} grid gap-8 mb-12`}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: themeColor }}>Bill To</p>
              <h3 className="font-bold text-slate-900 text-base">{client.company || client.name || "Client Name"}</h3>
              <div className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">
                {client.email && <div>{client.email}</div>}
                {client.phone && <div>{client.phone}</div>}
                {clientAddressLines.length > 0 && (
                  <div>{clientAddressLines.map((line, idx) => <div key={idx}>{line}</div>)}</div>
                )}
              </div>
              {!client.email && !client.phone && clientAddressLines.length === 0 && (
                <p className="text-sm text-slate-400 mt-2">Contact details not available</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: themeColor }}>Invoice Date</p>
              <p className="font-semibold text-slate-900 text-sm">{formatDateISO(invoice.issue_date || invoice.createdAt)}</p>
            </div>
            {showDueDate && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: themeColor }}>Due Date</p>
                <p className="font-semibold text-slate-900 text-sm">{formatDateISO(invoice.due_date || invoice.issue_date || invoice.createdAt)}</p>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="mb-12 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b-2" style={{ borderColor: themeColor }}>
                  <th className="py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: themeColor }}>Description</th>
                  <th className="py-3 text-[10px] font-bold uppercase tracking-wider text-right w-16" style={{ color: themeColor }}>Qty</th>
                  <th className="py-3 text-[10px] font-bold uppercase tracking-wider text-right w-20" style={{ color: themeColor }}>Price</th>
                  {showTax && <th className="py-3 text-[10px] font-bold uppercase tracking-wider text-right w-16" style={{ color: themeColor }}>Tax %</th>}
                  {showDiscount && <th className="py-3 text-[10px] font-bold uppercase tracking-wider text-right w-20" style={{ color: themeColor }}>Discount</th>}
                  <th className="py-3 text-[10px] font-bold uppercase tracking-wider text-right w-20" style={{ color: themeColor }}>Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => {
                  const itemPrice = Number(item.unit_price || item.price || 0);
                  const itemQty = Number(item.quantity || 0);
                  const itemTax = Number(item.tax_rate || 0);
                  const itemDiscount = Number(item.discount || 0);
                  const itemSubtotal = itemPrice * itemQty;
                  const itemTaxAmount = itemSubtotal * (itemTax / 100);
                  const itemTotal = itemSubtotal + itemTaxAmount - itemDiscount;
                  return (
                    <tr key={idx}>
                      <td className="py-4 pr-4">
                        <p className="font-semibold text-slate-900 text-sm">{item.description}</p>
                      </td>
                      <td className="py-4 text-right text-sm text-slate-600 font-medium">{itemQty}</td>
                      <td className="py-4 text-right text-sm text-slate-600 font-medium">{displayCurrency(itemPrice)}</td>
                      {showTax && <td className="py-4 text-right text-sm text-slate-600 font-medium">{itemTax}%</td>}
                      {showDiscount && <td className="py-4 text-right text-sm text-slate-600 font-medium">{displayCurrency(itemDiscount)}</td>}
                      <td className="py-4 text-right text-sm font-bold text-slate-900">{displayCurrency(itemTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-16">
            <div className="w-80">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-slate-900 font-medium">{displayCurrency(invoice.subtotal || 0)}</span>
              </div>
              {showTax && (
                <div className="flex justify-between py-2 text-sm border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Tax (Total)</span>
                  <span className="text-slate-900 font-medium">{displayCurrency(invoice.tax_amount || invoice.tax || 0)}</span>
                </div>
              )}
              {showDiscount && Number(invoice.discount_amount || 0) > 0 && (
                <div className="flex justify-between py-2 text-sm border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Discount</span>
                  <span className="text-slate-900 font-medium">-{displayCurrency(invoice.discount_amount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between py-4">
                <span className="font-bold uppercase tracking-wide text-base" style={{ color: themeColor }}>Total</span>
                <span className="font-bold text-slate-900 text-xl" style={{ color: themeColor }}>{displayCurrency(invoice.total_amount || invoice.total || 0)}</span>
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

          {!tplConfig.signatureUrl && (
            <div className="mb-12 flex justify-end">
              <div className="text-center">
                <div className="h-16 mb-2 border-b border-slate-300 pb-2"></div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Authorized Signature</p>
              </div>
            </div>
          )}

          {/* Footer Notes */}
          {showNotes && (
            <div className="pt-8 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: themeColor }}>Terms & Conditions</p>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl whitespace-pre-wrap">
                {invoice.notes || tplConfig.notes || tplConfig.defaultNotes || "Please include the invoice number in your wire transfer description. Payments are due within 30 days of invoice receipt. Late payments are subject to a 2% monthly interest fee."}
              </p>
            </div>
          )}
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
              
              {(invoice.status === 'finalised' || invoice.status === 'pending') && (
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

        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
