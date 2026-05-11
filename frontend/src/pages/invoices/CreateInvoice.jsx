import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { createInvoice } from "../../api/invoices";
import { formatDateISO } from "../../utils/date";
import { getClients } from "../../api/clients";
import { getProducts } from "../../api/products";
import { getTemplates } from "../../api/templates";
import toast from "react-hot-toast";
import { displayCurrency } from "../../utils/currency";

const invoiceSchema = yup.object().shape({
  clientId: yup.string().required("Please select a client"),
  templateId: yup.string().required("Please select a template"),
  dueDate: yup.date().optional().min(new Date(new Date().setHours(0, 0, 0, 0)), "Due date must be today or later"),
  lineItems: yup.array().of(
    yup.object().shape({
      product_id: yup.number().required("Please select a product"),
      description: yup.string().required("Description is required"),
      quantity: yup.number().positive("Quantity must be positive").required("Quantity is required"),
      price: yup.number().positive("Price must be positive").required("Price is required"),
      tax: yup.number().min(0).max(100).required("Tax rate is required"),
      discount: yup.number().min(0, "Discount must be a positive number").required("Discount is required")
    })
  ).min(1, "At least one line item is required")
});

const defaultLineItem = { product_id: null, description: "", quantity: 1, price: 0, tax: 10, discount: 0 };

const CreateInvoice = () => {
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(() => ({
    clientId: "",
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    dueDate: "",
    currency: "INR",
    notes: "",
    templateId: "",
    lineItems: [defaultLineItem]
  }));
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientData, templateData, productData] = await Promise.all([
          getClients(),
          getTemplates(),
          getProducts()
        ]);
        setClients(clientData);
        setTemplates(templateData);
        setProducts(productData);
        if (templateData && templateData.length > 0) {
          setForm(curr => ({ ...curr, templateId: templateData[0].id }));
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const updateLineItem = (index, field, value) => {
    setForm((current) => ({
      ...current,
      lineItems: current.lineItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: field === "description" ? value : Number(value) } : item
      )
    }));
  };

  const handleProductSelect = (index, productId) => {
    const product = products.find((product) => String(product.id) === String(productId));
    setForm((current) => ({
      ...current,
      lineItems: current.lineItems.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        if (!product) {
          return { ...item, product_id: null, description: "", price: 0, tax: 10 };
        }
        return {
          ...item,
          product_id: product.id,
          description: product.name,
          price: Number(product.price || 0),
          tax: Number(product.tax_rate || item.tax)
        };
      })
    }));
  };

  const addLineItem = () => {
    setForm((current) => ({ ...current, lineItems: [...current.lineItems, { ...defaultLineItem }] }));
  };

  const removeLineItem = (index) => {
    setForm((current) => ({
      ...current,
      lineItems: current.lineItems.filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const subtotal = useMemo(
    () => form.lineItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0),
    [form.lineItems]
  );
  const taxAmount = useMemo(
    () => form.lineItems.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.price || 0) * (Number(item.tax || 0) / 100)), 0),
    [form.lineItems]
  );
  const discountAmount = useMemo(
    () => form.lineItems.reduce((sum, item) => sum + Number(item.discount || 0), 0),
    [form.lineItems]
  );
  const total = Number((subtotal + taxAmount - discountAmount).toFixed(2));
  const currencySymbol = "₹";

  const handleSubmit = async (event, isDraft = false) => {
    event?.preventDefault();
    setError("");

    try {
      await invoiceSchema.validate({
        clientId: form.clientId,
        templateId: form.templateId,
        dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
        lineItems: form.lineItems
      }, { abortEarly: false });

      await createInvoice({
        client_id: form.clientId,
        template_id: form.templateId,
        invoice_number: form.invoiceNumber,
        due_date: form.dueDate,
        currency: form.currency,
        notes: form.notes,
        status: isDraft ? 'draft' : 'pending',
        total_amount: total,
        tax_amount: taxAmount,
        subtotal,
        items: form.lineItems.map(item => ({
          product_id: item.product_id,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          tax_rate: item.tax,
          discount: item.discount || 0
        }))
      });
      toast.success(isDraft ? "Draft saved successfully!" : "Invoice created successfully!");
      navigate("/app/invoices");
    } catch (err) {
      if (err.name === "ValidationError") {
        setError(err.errors[0]);
      } else {
        setError(err.message || "Unable to create invoice.");
      }
    }
  };

  const selectedClient = clients.find(c => String(c.id || c._id) === String(form.clientId));
  const selectedTemplate = templates.find(t => t.id === form.templateId);
  const tplConfig = selectedTemplate?.config || {};
  const disabledFields = tplConfig.disabledFields || [];
  const hasAnyTax = form.lineItems.some(item => Number(item.tax || 0) > 0);
  const hasAnyDiscount = form.lineItems.some(item => Number(item.discount || 0) > 0);
  const showInvoiceNumber = !disabledFields.includes("invoiceNumber");
  const showDueDate = !disabledFields.includes("dueDate");
  const showTax = !disabledFields.includes("tax") || hasAnyTax;
  const showDiscount = !disabledFields.includes("discount") || hasAnyDiscount;
  const showNotes = !disabledFields.includes("notes");
  const themeColor = tplConfig.themeColor || '#1e293b';
  const fontClass = tplConfig.typography === 'Merriweather' ? 'font-serif' : 
                   tplConfig.typography === 'Mono' ? 'font-mono' : 
                   'font-sans';
  const radiusClass = tplConfig.borderStyle === 'Sharp' ? 'rounded-none' : 
                     tplConfig.borderStyle === 'Soft' ? 'rounded shadow-lg' : 
                     'rounded';

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in-up pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            INVOICING SYSTEM
          </p>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">Create New Invoice</h2>
          <p className="text-sm text-slate-500 mt-1">Configure your line items and finalize your institutional billing document.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={(e) => handleSubmit(e, true)}>Save Draft</Button>
          <Button onClick={(e) => handleSubmit(e, false)}>Finalize Invoice</Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Form */}
        <div className="flex-1 space-y-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="flex flex-col justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Client Selection</p>
              <div className="relative mb-6">
                <select
                  className="w-full bg-gray-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none appearance-none"
                  name="clientId"
                  value={form.clientId}
                  onChange={handleChange}
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id || client._id} value={client.id || client._id}>
                      {client.company || client.name}
                    </option>
                  ))}
                </select>
                <span className="absolute right-4 top-3.5 text-slate-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Due Date</label>
                <div className="relative">
                  <input
                    type="date"
                    name="dueDate"
                    min={new Date().toISOString().split("T")[0]}
                    value={form.dueDate}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-slate-200 rounded-lg px-4 py-3 pr-10 text-sm text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M5 11h14M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </span>
                </div>
              </div>
              <div className="flex gap-3 text-xs text-blue-600 bg-blue-50 p-3 rounded-lg">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p>Last billed 14 days ago for {displayCurrency(4200)}. Net 30 payment terms applied automatically.</p>
              </div>
            </Card>
            
            <Card>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Invoice Template</p>
              <div className="flex gap-4 h-full overflow-x-auto pb-2">
                {templates.map(template => (
                  <label key={template.id} className={`flex-1 min-w-[120px] flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${form.templateId === template.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="templateId" value={template.id} checked={form.templateId === template.id} onChange={(e) => setForm(curr => ({ ...curr, templateId: Number(e.target.value) }))} className="hidden" />
                    <div className={`w-10 h-12 border ${form.templateId === template.id ? 'border-blue-500' : 'border-slate-300'} rounded mb-2 flex items-center justify-center shadow-sm bg-white overflow-hidden`}>
                       {template.config?.logoUrl ? <img src={template.config.logoUrl} alt="Logo" className="w-full h-full object-cover opacity-50" /> : <svg className={`w-5 h-5 ${form.templateId === template.id ? 'text-blue-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
                    </div>
                    <span className={`text-xs font-bold text-center ${form.templateId === template.id ? 'text-blue-700' : 'text-slate-600'}`}>{template.name}</span>
                  </label>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg tracking-tight">Invoice Line Items</h3>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse mb-4 min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 w-1/3">Description</th>
                    <th className="pb-3 text-right">Qty</th>
                    <th className="pb-3 text-right">Price</th>
                    <th className="pb-3 text-right">Tax %</th>
                    <th className="pb-3 text-right">Discount</th>
                    <th className="pb-3 text-right">Total</th>
                    <th className="pb-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {form.lineItems.map((item, index) => (
                    <tr key={index}>
                      <td className="py-4 pr-4">
                        <div className="space-y-2">
                          <select
                            className="w-full text-sm text-slate-900 border border-slate-200 bg-gray-50 rounded px-3 py-2 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
                            value={item.product_id ?? ""}
                            onChange={(e) => handleProductSelect(index, e.target.value)}
                          >
                            <option value="">Select product</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            className="w-full text-sm font-semibold text-slate-900 border border-slate-200 bg-gray-50 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-200 rounded px-3 py-2"
                            placeholder="Item description"
                            value={item.description}
                            readOnly={Boolean(item.product_id)}
                            onChange={(e) => updateLineItem(index, "description", e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <input
                          type="number"
                          className="w-16 text-sm text-slate-600 border border-slate-200 bg-gray-50 outline-none text-right focus:ring-2 focus:ring-slate-200 rounded px-2 py-2"
                          value={item.quantity}
                          min="1"
                          onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                        />
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-sm text-slate-400">{currencySymbol}</span>
                          <input
                            type="number"
                            className="w-24 text-sm text-slate-600 border border-slate-200 bg-gray-50 outline-none text-right pl-7 pr-2 py-2 focus:ring-2 focus:ring-slate-200 rounded"
                            value={item.price}
                            onChange={(e) => updateLineItem(index, "price", e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <input
                          type="number"
                          className="w-16 text-sm text-slate-600 border border-slate-200 bg-gray-50 outline-none text-right focus:ring-2 focus:ring-slate-200 rounded px-2 py-2"
                          value={item.tax}
                          onChange={(e) => updateLineItem(index, "tax", e.target.value)}
                        />
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-sm text-slate-400">{currencySymbol}</span>
                          <input
                            type="number"
                            className="w-20 text-sm text-slate-600 border border-slate-200 bg-gray-50 outline-none text-right pl-7 pr-2 py-2 focus:ring-2 focus:ring-slate-200 rounded"
                            value={item.discount}
                            onChange={(e) => updateLineItem(index, "discount", e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="py-4 text-right text-sm font-bold text-slate-900 pr-4">
                        {currencySymbol}{((item.quantity * item.price) * (1 + (item.tax / 100)) - Number(item.discount || 0)).toFixed(2)}
                      </td>
                      <td className="py-4 text-right">
                        <button type="button" onClick={() => removeLineItem(index)} disabled={form.lineItems.length === 1} className="text-slate-300 hover:text-rose-500 disabled:opacity-50 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              <button type="button" onClick={addLineItem} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-800 mb-8 mt-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Add new item
              </button>

              <div className="flex justify-end pt-6 border-t border-slate-100">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Subtotal</span>
                    <span className="text-slate-900 font-bold">{currencySymbol}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Total Tax</span>
                    <span className="text-slate-900 font-bold">{currencySymbol}{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Total Discount</span>
                    <span className="text-slate-900 font-bold">-{currencySymbol}{discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base pt-3 border-t border-slate-200">
                    <span className="font-bold text-slate-900 uppercase tracking-wide">Grand Total</span>
                    <span className="font-bold text-slate-900">{currencySymbol}{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {error && <p className="text-sm text-rose-500 font-semibold">{error}</p>}
        </div>

        {/* Right Side: Preview */}
        <div className="w-full lg:w-[380px] shrink-0 space-y-6">
          <Card className="p-0 overflow-hidden bg-slate-50 border-slate-200 flex flex-col h-[500px]">
            {/* Live Preview Paper */}
            <div className={`flex-1 p-6 overflow-y-auto custom-scrollbar flex justify-center ${fontClass}`}>
              <div className={`bg-white w-full h-max min-h-full shadow-sm border border-slate-200 p-6 flex flex-col ${radiusClass}`}>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    {tplConfig.logoUrl ? (
                      <img src={tplConfig.logoUrl} alt="Logo" className="h-8 object-contain mb-2" />
                    ) : (
                      <h4 className="font-bold text-[10px] uppercase tracking-wider" style={{ color: themeColor }}>{tplConfig.businessName || "FinPrecision"}</h4>
                    )}
                    <p className="text-[7px] text-slate-500 leading-tight mt-1 whitespace-pre-wrap">{tplConfig.businessAddress || "1080 Finance Way, Ste 400\nSan Francisco, CA 94105\ncontact@finprecision.io"}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="font-bold text-xs" style={{ color: themeColor }}>INVOICE</h3>
                    {showInvoiceNumber && <p className="text-[7px] text-slate-500">{form.invoiceNumber || "INV-XXXX-XXX"}</p>}
                  </div>
                </div>
                
                <div className={`${showDueDate ? 'grid-cols-3' : 'grid-cols-2'} grid gap-3 mb-6 text-[7px] leading-tight`}>
                  <div>
                    <p className="font-bold uppercase mb-1" style={{ color: themeColor }}>Bill To:</p>
                    <p className="font-bold text-slate-900 text-[8px]">{selectedClient?.company || selectedClient?.name || "Client Name"}</p>
                    {selectedClient?.email && <p className="text-slate-500 text-[6px] mt-0.5">{selectedClient.email}</p>}
                    {selectedClient?.phone && <p className="text-slate-500 text-[6px]">{selectedClient.phone}</p>}
                  </div>
                  <div>
                    <p className="font-bold uppercase mb-1" style={{ color: themeColor }}>Date Issued:</p>
                    <p className="font-bold text-slate-900 text-[8px]">{formatDateISO(new Date())}</p>
                  </div>
                  {showDueDate && (
                    <div>
                      <p className="font-bold uppercase mb-1" style={{ color: themeColor }}>Due Date:</p>
                      <p className="font-bold text-slate-900 text-[8px]">{form.dueDate ? formatDateISO(form.dueDate) : "Pending"}</p>
                    </div>
                  )}
                </div>

                <div className={`border-b pb-1 mb-2 grid ${showTax && showDiscount ? 'grid-cols-7' : showTax || showDiscount ? 'grid-cols-6' : 'grid-cols-5'} gap-1 text-[5px] font-bold uppercase`} style={{ borderColor: themeColor, color: themeColor }}>
                  <span className="col-span-2">Description</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Price</span>
                  {showTax && <span className="text-right">Tax %</span>}
                  {showDiscount && <span className="text-right">Discount</span>}
                  <span className="text-right">Total</span>
                </div>
                {form.lineItems.map((item, i) => {
                  const itemPrice = Number(item.price || 0);
                  const itemQty = Number(item.quantity || 0);
                  const itemTax = Number(item.tax || 0);
                  const itemDiscount = Number(item.discount || 0);
                  const itemTotal = itemQty * itemPrice * (1 + itemTax / 100) - itemDiscount;
                  return (
                    <div key={i} className={`grid ${showTax && showDiscount ? 'grid-cols-7' : showTax || showDiscount ? 'grid-cols-6' : 'grid-cols-5'} gap-1 text-[6px] mb-2 text-slate-700`}>
                      <span className="col-span-2 font-semibold">{item.description || "—"}</span>
                      <span className="text-right">{itemQty}</span>
                      <span className="text-right">{currencySymbol}{itemPrice.toFixed(2)}</span>
                      {showTax && <span className="text-right">{itemTax}%</span>}
                      {showDiscount && <span className="text-right">{currencySymbol}{itemDiscount.toFixed(2)}</span>}
                      <span className="text-right font-bold">{currencySymbol}{itemTotal.toFixed(2)}</span>
                    </div>
                  );
                })}

                <div className="mt-8 flex justify-end border-t border-slate-200 pt-2">
                  <div className="w-32 text-[7px]">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">Subtotal:</span>
                      <span className="font-semibold">{currencySymbol}{subtotal.toFixed(2)}</span>
                    </div>
                    {showTax && (
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-500">Tax:</span>
                        <span className="font-semibold">{currencySymbol}{taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {showDiscount && (
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-500">Discount:</span>
                        <span className="font-semibold">-{currencySymbol}{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold pt-1 border-t border-slate-300">
                      <span style={{ color: themeColor }}>Total:</span>
                      <span style={{ color: themeColor }}>{currencySymbol}{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {tplConfig.signatureUrl ? (
                  <div className="mt-4 flex justify-end">
                    <div className="text-center">
                      <img src={tplConfig.signatureUrl} alt="Signature" className="h-8 object-contain mb-1 border-b border-slate-300 pb-1" />
                      <p className="text-[5px] text-slate-400 uppercase tracking-wider">Authorized Signature</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex justify-end">
                    <div className="text-center">
                      <div className="h-8 mb-1 border-b border-slate-300 pb-1"></div>
                      <p className="text-[5px] text-slate-400 uppercase tracking-wider">Authorized Signature</p>
                    </div>
                  </div>
                )}

                {showNotes && (
                  <div className="mt-8 text-[6px] text-center text-slate-400 leading-tight px-4 whitespace-pre-wrap">
                    <p className="font-bold uppercase mb-1" style={{ color: themeColor }}>Terms & Conditions</p>
                    {tplConfig.notes || tplConfig.defaultNotes || "Thank you for your business. Please include invoice number on all correspondence. Payments are accepted via ACH, Wire, or Credit Card."}
                  </div>
                )}
              </div>
            </div>
            
            {/* Live Preview Bar */}
            <div className="h-10 bg-blue-600 flex items-center justify-between px-4 text-white text-[10px] font-bold uppercase tracking-wider shrink-0">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> Live Document Preview</span>
              <span className="bg-white/20 px-2 py-0.5 rounded">Draft V1.4</span>
            </div>
          </Card>

          <div className="bg-[#1e2330] rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
             </div>
             <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 relative z-10">Pro Finance Tip</p>
             <p className="text-xs text-slate-300 leading-relaxed relative z-10">
               Adding detailed descriptions to line items reduces dispute rates by 22% for enterprise clients.
             </p>
             <button className="absolute bottom-5 right-5 w-6 h-6 rounded bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
