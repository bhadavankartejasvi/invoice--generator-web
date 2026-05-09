import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { createTemplate, getTemplates, uploadTemplateAsset, updateTemplate, deleteTemplate } from "../../api/templates";

const fieldOptions = [
  { key: "invoiceNumber", label: "Invoice Number" },
  { key: "dueDate", label: "Due Date" },
  { key: "tax", label: "Tax Details" },
  { key: "discount", label: "Discount Field" },
  { key: "notes", label: "Terms & Conditions" }
];

const defaultForm = {
  name: "Modern Professional",
  themeColor: "#4f46e5",
  typography: "Inter",
  borderStyle: "Rounded",
  businessName: "Acme Corporation",
  businessAddress: "123 Business Avenue, Suite 100\nSan Francisco, CA 94107",
  disabledFields: ["discount"],
  logoUrl: "",
  signatureUrl: ""
};

const TemplateBuilder = () => {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [savedForm, setSavedForm] = useState(defaultForm);
  const [error, setError] = useState("");

  const loadTemplates = async () => {
    try {
      const response = await getTemplates();
      setTemplates(response);
      return response;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTemplates().then(response => {
      if (response && response.length > 0) {
        const active = response[0];
        const config = active.config || {};
        const loadedForm = {
          ...defaultForm,
          ...config,
          name: active.name || defaultForm.name,
        };
        setForm(loadedForm);
        setSavedForm(loadedForm);
      }
    });
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const toggleField = (key) => {
    setForm((current) => ({
      ...current,
      disabledFields: current.disabledFields.includes(key)
        ? current.disabledFields.filter((field) => field !== key)
        : [...current.disabledFields, key]
    }));
  };

  const uploadAsset = async (event, key) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await uploadTemplateAsset(formData);
      const fileUrl = response.file ? `http://localhost:5000/uploads/${response.file}` : (response.url || response.path || "");
      setForm((current) => ({ ...current, [key]: fileUrl }));
    } catch {
      toast.error("Failed to upload image");
    }
  };

  const handleSave = async () => {
    if (JSON.stringify(form) === JSON.stringify(savedForm)) {
      toast("No changes were made. Please adjust something before saving.", { icon: "ℹ️" });
      return;
    }

    try {
      const payload = {
        name: form.name,
        config: { ...form }
      };
      
      let saved;
      if (form.id) {
        saved = await updateTemplate(form.id, payload);
      } else {
        saved = await createTemplate(payload);
      }
      
      const updatedForm = { ...form, id: saved?.id || form.id };
      setError("");
      setForm(updatedForm);
      setSavedForm(updatedForm);
      await loadTemplates();
      toast.success("Template saved successfully");
    } catch (err) {
      setError(err.message || "Unable to save template.");
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    if (!window.confirm("Delete this template? Note: Past invoices using this template will remain unaffected.")) return;
    
    try {
      await deleteTemplate(form.id);
      setForm(defaultForm);
      setSavedForm(defaultForm);
      toast.success("Template deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete template");
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in-up pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>
            BRANDING STUDIO
          </p>
          <div className="flex items-center gap-4 mt-2">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Template Builder:</h2>
            <input 
              type="text" 
              name="name"
              value={form.name} 
              onChange={handleChange}
              className="text-2xl font-bold text-slate-700 bg-transparent border-b-2 border-slate-200 focus:border-indigo-500 focus:outline-none w-64 px-2 py-1"
              placeholder="Template Name"
            />
          </div>
          <p className="text-sm text-slate-500 mt-2">Customize your invoice appearance and default fields.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {templates.length > 0 && (
            <select 
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.id || ""}
              onChange={(e) => {
                if (!e.target.value) return;
                const selected = templates.find(t => t.id === Number(e.target.value));
                if (selected) {
                  const loadedForm = { ...defaultForm, ...selected.config, id: selected.id, name: selected.name };
                  setForm(loadedForm);
                  setSavedForm(loadedForm);
                }
              }}
            >
              <option value="" disabled>Load Template...</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
          {form.id && <Button variant="danger" onClick={handleDelete}>Delete</Button>}
          <Button variant="secondary" onClick={() => setForm(savedForm)}>Discard Changes</Button>
          <Button onClick={handleSave}>Save Template</Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Form Controls */}
        <div className="flex-1 space-y-6 w-full">
          {/* Global Styles Box */}
          <Card className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Global Styles</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Theme Color</label>
                <div className="flex gap-4 items-center">
                  <input type="color" name="themeColor" value={form.themeColor} onChange={handleChange} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                  <Input name="themeColor" value={form.themeColor} onChange={handleChange} className="w-32 uppercase font-mono text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Typography</label>
                  <select name="typography" value={form.typography} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none">
                    <option value="Inter">Inter (Default)</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Merriweather">Merriweather</option>
                    <option value="Mono">Monospace</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Border Style</label>
                  <select name="borderStyle" value={form.borderStyle} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none">
                    <option value="Rounded">Rounded</option>
                    <option value="Sharp">Sharp edges</option>
                    <option value="Soft">Soft shadow</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Invoice Header Box */}
          <Card className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Invoice Header</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Logo Upload</label>
                <div className="flex items-center gap-4 border-2 border-dashed border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="w-16 h-16 bg-white border border-slate-200 rounded flex items-center justify-center shrink-0">
                    {form.logoUrl ? <img src={form.logoUrl} alt="Logo" className="max-w-full max-h-full p-1" /> : <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>}
                  </div>
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={(event) => uploadAsset(event, "logoUrl")} className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800" />
                    <p className="text-[10px] text-slate-400 mt-2">Recommended: 400x100px transparent PNG</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 mt-4">Signature Upload</label>
                <div className="flex items-center gap-4 border-2 border-dashed border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="w-24 h-12 bg-white border border-slate-200 rounded flex items-center justify-center shrink-0 overflow-hidden">
                    {form.signatureUrl ? <img src={form.signatureUrl} alt="Signature" className="max-w-full max-h-full object-contain p-1" /> : <span className="text-[9px] text-slate-300 font-bold uppercase">No Sig</span>}
                  </div>
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={(event) => uploadAsset(event, "signatureUrl")} className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800" />
                    <p className="text-[10px] text-slate-400 mt-2">Recommended: transparent PNG of signature</p>
                  </div>
                </div>
              </div>
              <Input label="Business Name" name="businessName" value={form.businessName} onChange={handleChange} />
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Business Address</label>
                <textarea
                  name="businessAddress"
                  value={form.businessAddress}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
                />
              </div>
            </div>
          </Card>

          {/* Invoice Content Box */}
          <Card className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Invoice Content</h3>
            </div>
            <div className="p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4">Visible Fields</p>
              <div className="space-y-3">
                {fieldOptions.map((field) => (
                  <div key={field.key} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={!form.disabledFields.includes(field.key)} onChange={() => toggleField(field.key)} />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          
          {error && <p className="text-sm text-rose-500 font-semibold">{error}</p>}
        </div>

        {/* Right Side: Preview */}
        <div className="w-full lg:w-[480px] shrink-0 space-y-6 sticky top-6">
          <Card className="p-0 overflow-hidden bg-slate-100 border-slate-200 flex flex-col h-[700px]">
            {/* Live Preview Paper */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex justify-center">
              <div className="bg-white w-full h-max min-h-full shadow-sm border border-slate-200 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    {form.logoUrl ? (
                      <img src={form.logoUrl} alt="Logo" className="h-8 mb-4 object-contain" />
                    ) : (
                      <div className="w-8 h-8 rounded mb-4 flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: form.themeColor }}>
                        {form.businessName?.substring(0,2).toUpperCase() || 'AB'}
                      </div>
                    )}
                    <h4 className="font-bold text-sm tracking-tight text-slate-900">{form.businessName || "Business Name"}</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-1 whitespace-pre-wrap">{form.businessAddress || "123 Business Rd.\nCity, State 12345"}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="font-bold text-2xl tracking-tight" style={{ color: form.themeColor }}>INVOICE</h3>
                    {!form.disabledFields.includes("invoiceNumber") && <p className="text-[10px] text-slate-500 mt-1">INV-2024-001</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-10 text-[10px] leading-relaxed">
                  <div>
                    <p className="font-bold uppercase text-slate-400 mb-1">Bill To:</p>
                    <p className="font-bold text-slate-900">Client Company LLC</p>
                    <p className="text-slate-500">client@example.com</p>
                  </div>
                  <div className="text-right">
                    <div className="mb-3">
                      <p className="font-bold uppercase text-slate-400 mb-0.5">Date Issued:</p>
                      <p className="font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
                    </div>
                    {!form.disabledFields.includes("dueDate") && (
                      <div>
                        <p className="font-bold uppercase text-slate-400 mb-0.5">Due Date:</p>
                        <p className="font-bold text-slate-900">Net 30 Days</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="border-b-2 pb-2 mb-3 flex justify-between text-[9px] font-bold uppercase text-slate-900 tracking-wider" style={{ borderColor: form.themeColor }}>
                    <span>Description</span>
                    <div className="flex gap-12 w-48 justify-end">
                      <span>Qty</span>
                      <span>Price</span>
                      <span>Total</span>
                    </div>
                  </div>
                  
                  {[1, 2].map((i) => (
                    <div key={i} className="flex justify-between text-[11px] mb-3 text-slate-700 py-1">
                      <span className="font-semibold">Sample Service Line Item {i}</span>
                      <div className="flex gap-12 w-48 justify-end">
                        <span>1</span>
                        <span>$150.00</span>
                        <span className="font-bold text-slate-900">$150.00</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 flex justify-end">
                  <div className="w-48 text-[11px]">
                    <div className="flex justify-between py-1.5 text-slate-500">
                      <span>Subtotal</span>
                      <span>$300.00</span>
                    </div>
                    {!form.disabledFields.includes("tax") && (
                      <div className="flex justify-between py-1.5 text-slate-500">
                        <span>Tax (10%)</span>
                        <span>$30.00</span>
                      </div>
                    )}
                    {!form.disabledFields.includes("discount") && (
                      <div className="flex justify-between py-1.5 text-emerald-600">
                        <span>Discount</span>
                        <span>-$10.00</span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 mt-1 border-t border-slate-200">
                      <span className="font-bold uppercase tracking-wide text-slate-900">Total</span>
                      <span className="font-bold text-sm" style={{ color: form.themeColor }}>$320.00</span>
                    </div>
                  </div>
                </div>
                
                {!form.disabledFields.includes("notes") && (
                  <div className="mt-12 pt-6 border-t border-slate-100 text-[9px] text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-700 block mb-1">Terms & Conditions</span>
                    Please make payment within 30 days of receiving this invoice. Late payments are subject to a 1.5% monthly fee.
                  </div>
                )}
                {form.signatureUrl && (
                  <div className="mt-8 flex justify-end">
                    <div className="text-center w-48">
                      <img src={form.signatureUrl} alt="Signature" className="h-16 object-contain mx-auto border-b border-slate-200 mb-2 pb-1" />
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Authorized Signature</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Live Preview Bar */}
            <div className="h-10 bg-slate-900 flex items-center justify-between px-4 text-white text-[10px] font-bold uppercase tracking-wider shrink-0">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span> Live Document Preview</span>
              <span className="text-slate-400">Scale: 75%</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TemplateBuilder;
