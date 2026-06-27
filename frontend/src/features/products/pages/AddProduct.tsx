import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { useAuth } from '@/features/auth';
import { productService } from '@/features/products';
import { Button, Input } from '@/components/ui';
import { ArrowLeft, Package, Leaf, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from "sonner";
import type { Category } from '@/types';

type UnitType = 'kg' | 'g' | 'l' | 'unit' | 'dozen';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  unit: UnitType;
  stock_quantity: string;
  minimum_order: string;
  is_organic: boolean;
  is_available: boolean;
  harvest_date: string;
  category: string;
}

const UNITS: { value: UnitType; label: string }[] = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'l', label: 'Liter (L)' },
  { value: 'unit', label: 'Unit' },
  { value: 'dozen', label: 'Dozen' },
];

const AddProduct = () => {
  useSEO({ title: 'Add Product', description: 'List a new product on Farmket marketplace.' });
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    unit: 'kg',
    stock_quantity: '',
    minimum_order: '1',
    is_organic: false,
    is_available: true,
    harvest_date: '',
    category: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    productService.getCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, []);

  if (user?.user_type !== 'farmer') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <Package className="mx-auto h-12 w-12 text-foreground-secondary mb-4" />
        <h2 className="text-xl font-display font-bold text-foreground mb-2">Farmers Only</h2>
        <p className="text-foreground-secondary">Only farmer accounts can list products.</p>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!form.price || parseFloat(form.price) <= 0) { toast.error('Enter a valid price'); return; }
    if (!form.stock_quantity || parseInt(form.stock_quantity) < 0) {
      toast.error('Enter a valid stock quantity'); return;
    }
    if (!form.description.trim()) { toast.error('Description is required'); return; }

    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== '' && val !== null && val !== undefined) {
          formData.append(key, String(val));
        }
      });
      if (imageFile) {
        // We submit image as a product image separately after product creation
        // For now include it for single-image support
        formData.append('image', imageFile);
      }

      const product = await productService.createProduct(formData);

      // If we have an image, upload it as ProductImage
      if (imageFile) {
        const imgForm = new FormData();
        imgForm.append('image', imageFile);
        imgForm.append('is_primary', 'true');
        try {
          const { default: api } = await import('@/lib/api');
          await api.post(`/products/products/${product.slug}/images/`, imgForm, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch {
          // Non-fatal if image upload fails after product creation
        }
      }

      toast.success(`"${product.name}" listed successfully! 🌱`);
      navigate('/dashboard/products');
    } catch (err: any) {
      const data = err?.response?.data;
      if (data) {
        const firstError = Object.values(data)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        toast.error('Failed to create product');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl w-full">
      {/* Back link */}
      <Link to="/dashboard/products" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground-secondary hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to My Products
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Add New Product</h1>
        <p className="text-sm font-medium text-foreground-secondary mb-8">List a fresh product for buyers to discover.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Image */}
          <div className="rounded-3xl bg-surface border border-border-subtle p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-bold text-foreground">Product Image</h2>
            </div>
            <label
              htmlFor="product-image"
              className="flex flex-col items-center justify-center h-48 rounded-2xl border-2 border-dashed border-border-strong bg-surface-elevated cursor-pointer hover:border-brand hover:bg-brand-muted/10 transition-colors overflow-hidden group"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="text-center">
                  <div className="bg-surface border border-border-subtle h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-sm">
                    <ImageIcon className="h-6 w-6 text-foreground-secondary" />
                  </div>
                  <p className="text-sm font-bold text-foreground-secondary">Click to upload product image</p>
                  <p className="text-xs font-medium text-foreground-secondary/70 mt-1 uppercase tracking-widest">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input
                id="product-image"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* Basic Info */}
          <div className="rounded-3xl bg-surface border border-border-subtle p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-bold text-foreground">Basic Information</h2>
            </div>

            <Input
              label="Product Name *"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Fresh Alphonso Mangoes"
              required
            />

            <div>
              <label className="block text-xs font-bold text-foreground-secondary mb-2 uppercase tracking-widest">
                Description *
              </label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your product — quality, origin, harvest conditions…"
                className="w-full rounded-2xl border border-border-strong bg-surface px-4 py-3 text-sm font-medium text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all resize-none shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground-secondary mb-2 uppercase tracking-widest">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-border-strong bg-surface px-4 py-3.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all shadow-sm appearance-none"
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="rounded-3xl bg-surface border border-border-subtle p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-2">Pricing & Stock</h2>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price (₹) *"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
              <div>
                <label className="block text-xs font-bold text-foreground-secondary mb-2 uppercase tracking-widest">Unit *</label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-border-strong bg-surface px-4 py-3.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all shadow-sm appearance-none"
                >
                  {UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Stock Quantity *"
                name="stock_quantity"
                type="number"
                min="0"
                value={form.stock_quantity}
                onChange={handleChange}
                placeholder="100"
                required
              />
              <Input
                label="Minimum Order"
                name="minimum_order"
                type="number"
                min="1"
                value={form.minimum_order}
                onChange={handleChange}
                placeholder="1"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground-secondary mb-2 uppercase tracking-widest">
                Harvest Date
              </label>
              <input
                type="date"
                name="harvest_date"
                value={form.harvest_date}
                onChange={handleChange}
                className="w-full rounded-2xl border border-border-strong bg-surface px-4 py-3.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="rounded-3xl bg-surface border border-border-subtle p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-2">Product Flags</h2>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl hover:bg-surface-elevated transition-colors border border-transparent hover:border-border-subtle">
              <input
                type="checkbox"
                name="is_organic"
                checked={form.is_organic}
                onChange={handleChange}
                className="h-5 w-5 rounded-md border-border-strong text-brand focus:ring-brand bg-surface"
              />
              <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Leaf className="h-4 w-4 text-success" /> Organic certified product
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl hover:bg-surface-elevated transition-colors border border-transparent hover:border-border-subtle">
              <input
                type="checkbox"
                name="is_available"
                checked={form.is_available}
                onChange={handleChange}
                className="h-5 w-5 rounded-md border-border-strong text-brand focus:ring-brand bg-surface"
              />
              <span className="text-sm font-bold text-foreground">
                List as available in marketplace
              </span>
            </label>
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <Link to="/dashboard/products">
              <Button type="button" variant="outline" className="h-12 px-6 rounded-full font-bold">Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" isLoading={saving} className="h-12 px-6 rounded-full font-bold gap-2">
              <Package className="h-5 w-5" /> List Product
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddProduct;
