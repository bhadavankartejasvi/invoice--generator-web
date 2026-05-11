import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import * as yup from "yup";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../api/products";
import { displayCurrency } from "../../utils/currency";

const productSchema = yup.object().shape({
  name: yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
  sku: yup.string().min(1, "SKU is required").required("SKU is required"),
  price: yup.number().positive("Price must be positive").required("Price is required"),
  description: yup.string().optional()
});

const initialProduct = { name: "", sku: "", price: "", description: "" };

const Products = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState(initialProduct);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const loadProducts = async (query = "") => {
    try {
      const data = await getProducts(query);
      setProducts(data);
    } catch {
      toast.error("Failed to load products");
      setProducts([]);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadProducts(search);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleOpen = (product = null) => {
    setSelectedProduct(product);
    setFormData(product ? { ...product } : initialProduct);
    setError("");
    setOpenModal(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await productSchema.validate(formData, { abortEarly: false });
      if (selectedProduct) {
        await updateProduct(selectedProduct.id || selectedProduct._id, {
          ...formData,
          price: Number(formData.price)
        });
        toast.success("Product updated");
      } else {
        await createProduct({
          ...formData,
          price: Number(formData.price)
        });
        toast.success("Product created");
      }
      setOpenModal(false);
      loadProducts(search);
    } catch (err) {
      const message = err.name === "ValidationError"
        ? err.errors[0]
        : err.response?.data?.message || err.message || "Unable to save product.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm("Remove this product?")) return;
    try {
      await deleteProduct(product.id || product._id);
      toast.success("Product deleted");
      loadProducts(search);
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const columns = useMemo(
    () => [
      { 
        key: "name", 
        label: "Product Name",
        render: (product) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            <span className="font-bold text-slate-900">{product.name}</span>
          </div>
        )
      },
      { key: "sku", label: "SKU", render: (product) => <span className="text-slate-500 font-mono text-xs">{product.sku}</span> },
      { key: "category", label: "Category", render: () => <span className="text-slate-500">Service</span> },
      { key: "price", label: "Price", render: (product) => <span className="font-bold text-slate-900">{displayCurrency(product.price)}</span> },
      { 
        key: "stock", 
        label: "Stock Level",
        render: () => (
          <div className="flex items-center gap-2">
            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[80%] rounded-full"></div>
            </div>
            <span className="text-xs text-slate-500">In stock</span>
          </div>
        )
      },
      {
        key: "actions",
        label: "Actions",
        render: (product) => (
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-indigo-600 transition" onClick={() => handleOpen(product)}>
              Edit
            </button>
            <span className="text-slate-300">|</span>
            <button className="text-slate-400 hover:text-rose-600 transition" onClick={() => handleDelete(product)}>
              Delete
            </button>
          </div>
        )
      }
    ],
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="space-y-6 animate-fade-in-up max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Products</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and track your global inventory assets with precision.</p>
        </div>
        <Button onClick={() => handleOpen()}>+ Add Product</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Inventory Value</p>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-slate-900">{displayCurrency(products.reduce((sum, product) => sum + (Number(product.price) || 0), 0))}</p>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 mt-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            +12.5% vs last month
          </span>
        </Card>
        <Card className="flex flex-col justify-center relative">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Active Products</p>
          <p className="text-3xl font-bold text-slate-900">1,429</p>
          <p className="text-[11px] text-slate-500 mt-2">8 new added this week</p>
        </Card>
        <Card className="flex flex-col justify-center border-l-4 border-l-rose-500 bg-rose-50/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500 mb-1">Low Stock Alerts</p>
              <p className="text-3xl font-bold text-rose-600">24</p>
            </div>
            <div className="w-8 h-8 rounded bg-rose-100 text-rose-500 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
          </div>
          <button className="text-[11px] font-semibold text-rose-600 text-left mt-2 hover:underline">Review items &rarr;</button>
        </Card>
      </div>

      <Card>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
          </div>
          <div className="relative w-full sm:max-w-xs">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
            <span className="absolute left-3 top-2.5 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
          </div>
        </div>
        <Table columns={columns} data={products.map((product) => ({ ...product, id: product.id || product._id }))} />
      </Card>

      <Modal
        open={openModal}
        title={selectedProduct ? "Edit Product" : "Add Product"}
        description="Keep descriptions, SKU, and pricing up to date."
        onClose={() => setOpenModal(false)}
        footer={
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleSubmit} disabled={loading}>{selectedProduct ? "Update Product" : "Save Product"}</Button>
            <Button type="button" variant="secondary" onClick={() => setOpenModal(false)}>Cancel</Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Name" name="name" value={formData.name} onChange={handleChange} required />
          <Input label="SKU" name="sku" value={formData.sku} onChange={handleChange} required />
          <Input label="Price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required />
          <div className="space-y-1.5">
            <label className="block text-[13px] font-semibold text-slate-700 uppercase tracking-wide">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-50 border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          {error && <p className="text-sm text-rose-500 font-semibold">{error}</p>}
        </form>
      </Modal>
    </div>
  );
};

export default Products;
