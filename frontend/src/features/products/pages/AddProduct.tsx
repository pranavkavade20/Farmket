import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { useAuth } from '@/features/auth';
import { productService } from '@/features/products';
import {
  PageHeader,
  Button,
  Input,
  Textarea,
  Select,
  Switch,
  Badge,
  PageSkeleton,
} from '@/components/ui';
import {
  ArrowLeft,
  Package,
  Leaf,
  Image as ImageIcon,
  Trash2,
  UploadCloud,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Layers,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { Category, Product, ProductImage } from '@/types';

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
  { value: 'unit', label: 'Single Unit' },
  { value: 'dozen', label: 'Dozen (12 pcs)' },
];

export const AddProduct: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const isEditMode = Boolean(slug);

  useSEO({
    title: isEditMode ? 'Edit Produce | Farmket' : 'List New Produce | Farmket',
    description: isEditMode
      ? 'Update produce specifications, harvest schedules, and marketplace parameters.'
      : 'List fresh farm harvest for buyers and pre-order reservations.',
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  // Primary form state
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

  // Media state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Metadata & Execution state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Guard: Only farmers can access this page
  useEffect(() => {
    if (user && user.user_type !== 'farmer') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load categories
  useEffect(() => {
    let isMounted = true;
    productService
      .getCategories()
      .then((data) => {
        if (isMounted) setCategories(data);
      })
      .catch(() => {
        // Non-blocking fallback
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // In edit mode: fetch existing product details
  useEffect(() => {
    if (!slug) return;
    let isMounted = true;

    productService
      .getProduct(slug)
      .then((product: Product) => {
        if (!isMounted) return;
        setForm({
          name: product.name,
          description: product.description,
          price: product.price ? String(parseFloat(product.price)) : '',
          unit: product.unit || 'kg',
          stock_quantity: String(product.stock_quantity ?? 0),
          minimum_order: String(product.minimum_order ?? 1),
          is_organic: Boolean(product.is_organic),
          is_available: Boolean(product.is_available),
          harvest_date: product.harvest_date || '',
          category: product.category ? String(product.category) : '',
        });
        setExistingImages(product.images || []);
        const primaryImg =
          product.images?.find((img) => img.is_primary)?.image ?? product.images?.[0]?.image;
        if (primaryImg) {
          setImagePreview(primaryImg);
        }
      })
      .catch(() => {
        if (isMounted) {
          toast.error('Failed to load product specifications');
          navigate('/dashboard/products');
        }
      })
      .finally(() => {
        if (isMounted) setLoadingInitial(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFileSelection = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (errors.image) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.image;
        return next;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelection(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelection(file);
  };

  const handleDeleteExistingImage = async (imageId: number) => {
    if (!slug) return;
    try {
      await productService.deleteProductImage(slug, imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success('Image removed from listing');
    } catch {
      toast.error('Failed to delete image');
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Produce name is required';
    else if (form.name.trim().length < 3) errs.name = 'Name must be at least 3 characters';

    if (!form.description.trim()) errs.description = 'Produce description is required';
    else if (form.description.trim().length < 10)
      errs.description = 'Description should be at least 10 characters';

    if (!form.category) errs.category = 'Please select a produce category';

    const parsedPrice = parseFloat(form.price);
    if (!form.price || isNaN(parsedPrice) || parsedPrice <= 0) {
      errs.price = 'Please enter a valid price greater than ₹0';
    }

    const parsedStock = parseInt(form.stock_quantity, 10);
    if (form.stock_quantity === '' || isNaN(parsedStock) || parsedStock < 0) {
      errs.stock_quantity = 'Stock quantity cannot be negative';
    }

    const parsedMinOrder = parseInt(form.minimum_order, 10);
    if (form.minimum_order === '' || isNaN(parsedMinOrder) || parsedMinOrder < 1) {
      errs.minimum_order = 'Minimum order must be at least 1';
    }

    if (!isEditMode && !imageFile && !imagePreview) {
      errs.image = 'At least one produce image is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please resolve the highlighted fields before submitting');
      return;
    }

    setSaving(true);
    try {
      if (isEditMode && slug) {
        // Edit flow
        const updated = await productService.updateProduct(slug, {
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category ? parseInt(form.category, 10) : null,
          price: form.price,
          unit: form.unit,
          stock_quantity: parseInt(form.stock_quantity, 10),
          minimum_order: parseInt(form.minimum_order, 10),
          is_organic: form.is_organic,
          is_available: form.is_available,
          harvest_date: form.harvest_date || null,
        });

        // Upload replacement or additional image if selected
        if (imageFile) {
          const imgForm = new FormData();
          imgForm.append('image', imageFile);
          imgForm.append('is_primary', 'true');
          try {
            await productService.uploadProductImage(slug, imgForm);
          } catch {
            // Non-fatal if secondary image upload fails
          }
        }

        toast.success(`"${updated.name}" updated successfully! 🌱`);
        navigate('/dashboard/products');
      } else {
        // Create flow
        const formData = new FormData();
        formData.append('name', form.name.trim());
        formData.append('description', form.description.trim());
        if (form.category) formData.append('category', form.category);
        formData.append('price', form.price);
        formData.append('unit', form.unit);
        formData.append('stock_quantity', form.stock_quantity);
        formData.append('minimum_order', form.minimum_order);
        formData.append('is_organic', String(form.is_organic));
        formData.append('is_available', String(form.is_available));
        if (form.harvest_date) formData.append('harvest_date', form.harvest_date);

        if (imageFile) {
          formData.append('image', imageFile);
        }

        const newProduct = await productService.createProduct(formData);

        // Upload as primary ProductImage
        if (imageFile) {
          const imgForm = new FormData();
          imgForm.append('image', imageFile);
          imgForm.append('is_primary', 'true');
          try {
            await productService.uploadProductImage(newProduct.slug, imgForm);
          } catch {
            // Non-fatal
          }
        }

        toast.success(`"${newProduct.name}" listed successfully on marketplace! 🌱`);
        navigate('/dashboard/products');
      }
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string | string[]> } })?.response?.data;
      if (data) {
        const firstError = Object.values(data)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        toast.error(isEditMode ? 'Failed to update produce listing' : 'Failed to create produce listing');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial) {
    return <PageSkeleton />;
  }

  const categoryOptions = [
    { label: 'Select a category…', value: '' },
    ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-16">
      {/* ── Page Header ── */}
      <PageHeader
        title={isEditMode ? 'Edit Produce Listing' : 'List New Farm Harvest'}
        badge={
          <Badge variant="brand">
            {isEditMode ? 'Listing Editor' : 'Direct Farm Listing'}
          </Badge>
        }
        description={
          isEditMode
            ? 'Update harvest specifications, unit pricing, real-time inventory, and marketplace availability.'
            : 'Publish fresh agricultural produce for verified regional buyers, institutions, and community pre-orders.'
        }
        actions={
          <Link to="/dashboard/products">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Inventory</span>
            </Button>
          </Link>
        }
      />

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* ── Section 1: Produce Media & Imagery ── */}
        <div className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-brand-muted/40 border border-brand/20 flex items-center justify-center text-brand">
                <ImageIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">Produce Media</h3>
                <p className="text-xs text-foreground-secondary">
                  High-resolution photography increases buyer pre-order conversion.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-foreground-secondary uppercase tracking-wider">
              {imagePreview ? '1 Image Selected' : 'Required'}
            </span>
          </div>

          {/* Media Dropzone Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-6 transition-all flex flex-col items-center justify-center text-center ${
              isDragging
                ? 'border-brand bg-brand-muted/20 ring-4 ring-brand/10'
                : errors.image
                ? 'border-danger/70 bg-danger-muted/10'
                : 'border-border-strong bg-surface-elevated/40 hover:border-brand/60 hover:bg-surface-elevated'
            }`}
          >
            {imagePreview ? (
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-lg">
                <div className="relative aspect-[4/3] w-48 rounded-xl overflow-hidden bg-surface border border-border-subtle shadow-sm shrink-0">
                  <img
                    src={imagePreview}
                    alt="Produce Preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="brand" size="sm" className="shadow-xs backdrop-blur-md">
                      Primary
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <p className="text-sm font-bold text-foreground">
                    {imageFile ? imageFile.name : 'Current Marketplace Image'}
                  </p>
                  <p className="text-xs text-foreground-secondary">
                    {imageFile
                      ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload`
                      : 'Active primary image for this listing.'}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2 justify-center sm:justify-start">
                    <label
                      htmlFor="produce-image-input"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border-subtle text-foreground hover:bg-state-hover cursor-pointer transition-colors shadow-2xs"
                    >
                      <UploadCloud className="h-3.5 w-3.5 text-brand" /> Replace Image
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-danger hover:bg-danger-muted/30 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <label
                htmlFor="produce-image-input"
                className="cursor-pointer flex flex-col items-center justify-center w-full py-6 group"
              >
                <div className="h-14 w-14 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center text-foreground-secondary mb-3 group-hover:scale-105 group-hover:text-brand transition-all shadow-xs">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1">
                  Click or drag produce image to upload
                </h4>
                <p className="text-xs text-foreground-secondary max-w-sm">
                  Support PNG, JPG, or WebP up to 5MB. Showcase fresh harvest appearance.
                </p>
              </label>
            )}

            <input
              id="produce-image-input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={handleImageChange}
            />
          </div>

          {errors.image && (
            <p className="text-xs font-semibold text-danger" role="alert">{errors.image}</p>
          )}

          {/* Existing Gallery in Edit Mode */}
          {isEditMode && existingImages.length > 1 && (
            <div className="pt-3 border-t border-border-subtle space-y-2">
              <span className="text-xs font-semibold text-foreground-secondary">
                Additional Gallery Photos ({existingImages.length}):
              </span>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative group h-16 w-16 rounded-xl overflow-hidden border border-border-subtle bg-surface-elevated"
                  >
                    <img
                      src={img.image}
                      alt="Thumbnail"
                      className="h-full w-full object-cover"
                    />
                    {!img.is_primary && (
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(img.id)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer focus-ring"
                        title="Delete image"
                        aria-label="Delete image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Section 2: Basic Harvest Specifications ── */}
        <div className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
            <div className="h-9 w-9 rounded-xl bg-brand-muted/40 border border-brand/20 flex items-center justify-center text-brand">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">Harvest Specifications</h3>
              <p className="text-xs text-foreground-secondary">
                Accurate produce naming and category classification for catalog search.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Produce Name *"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Organic Alphonso Mangoes (Devgad)"
                error={errors.name}
                helperText="Include crop variety and geographic indication if applicable."
                required
              />
            </div>

            <div className="sm:col-span-2">
              <Select
                label="Produce Category *"
                name="category"
                value={form.category}
                onChange={handleChange}
                options={categoryOptions}
                error={errors.category}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <Textarea
                label="Produce Description *"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your produce: soil cultivation practices, pesticide-free verification, moisture level, taste profile, and storage instructions…"
                error={errors.description}
                helperText="Buyers and wholesalers review descriptions for quality guarantees."
                required
              />
            </div>
          </div>
        </div>

        {/* ── Section 3: Pricing, Inventory & Scheduling ── */}
        <div className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
            <div className="h-9 w-9 rounded-xl bg-brand-muted/40 border border-brand/20 flex items-center justify-center text-brand">
              <IndianRupee className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">Pricing & Inventory</h3>
              <p className="text-xs text-foreground-secondary">
                Set fair producer pricing, bulk minimums, and projected harvest availability.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Unit Price (₹) *"
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                icon={<IndianRupee className="h-4 w-4 text-foreground-secondary" />}
                error={errors.price}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground-secondary mb-1.5">
                Selling Unit *
              </label>
              <Select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                options={UNITS}
              />
            </div>

            <div>
              <Input
                label={`Available Stock Quantity (${form.unit}) *`}
                name="stock_quantity"
                type="number"
                min="0"
                value={form.stock_quantity}
                onChange={handleChange}
                placeholder="100"
                icon={<Layers className="h-4 w-4 text-foreground-secondary" />}
                error={errors.stock_quantity}
                helperText="Warehouse inventory available for instant dispatch."
                required
              />
            </div>

            <div>
              <Input
                label={`Minimum Order (${form.unit}) *`}
                name="minimum_order"
                type="number"
                min="1"
                value={form.minimum_order}
                onChange={handleChange}
                placeholder="1"
                icon={<ShoppingCart className="h-4 w-4 text-foreground-secondary" />}
                error={errors.minimum_order}
                helperText="Minimum quantity a buyer can add to cart."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground-secondary mb-1.5">
                Target Harvest Date (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-secondary">
                  <Calendar className="h-4 w-4" />
                </span>
                <input
                  type="date"
                  name="harvest_date"
                  value={form.harvest_date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-strong rounded-xl text-sm text-foreground focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all shadow-2xs"
                />
              </div>
              <p className="text-xs text-foreground-secondary mt-1">
                Setting a future harvest date allows buyers to pre-book upcoming supply.
              </p>
            </div>
          </div>
        </div>

        {/* ── Section 4: Quality Verification & Marketplace Visibility ── */}
        <div className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
            <div className="h-9 w-9 rounded-xl bg-brand-muted/40 border border-brand/20 flex items-center justify-center text-brand">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">Quality & Visibility</h3>
              <p className="text-xs text-foreground-secondary">
                Configure organic certification credentials and public listing status.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle">
              <Switch
                checked={form.is_organic}
                onChange={(checked) => setForm((prev) => ({ ...prev, is_organic: checked }))}
                label={
                  <span className="flex items-center gap-2 font-bold text-foreground">
                    <Leaf className="h-4 w-4 text-brand" /> Certified Organic Produce
                  </span>
                }
                description="Display organic verification badge to health-conscious consumers."
              />
            </div>

            <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle">
              <Switch
                checked={form.is_available}
                onChange={(checked) => setForm((prev) => ({ ...prev, is_available: checked }))}
                label={
                  <span className="flex items-center gap-2 font-bold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success" /> Available on Marketplace
                  </span>
                }
                description={
                  form.is_available
                    ? 'Listing is active and immediately visible in public search.'
                    : 'Listing is hidden/paused from marketplace catalog.'
                }
              />
            </div>
          </div>

          {/* Forward Supply Integration Notice */}
          <div className="p-3.5 rounded-xl bg-brand-muted/20 border border-brand/20 flex items-start gap-3 text-xs text-foreground-secondary">
            <Sparkles className="h-4 w-4 text-brand shrink-0 mt-0.5" />
            <p>
              Looking to fund your crop cycle early? You can link this produce listing to an active field
              growth in{' '}
              <Link to="/farmer/crops" className="font-bold text-brand hover:underline">
                Crop Lifecycle Management
              </Link>{' '}
              to accept forward pre-bookings from buyers before harvest.
            </p>
          </div>
        </div>

        {/* ── Form Actions Bar ── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/dashboard/products">
            <Button type="button" variant="outline" size="lg" disabled={saving}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="brand"
            size="lg"
            isLoading={saving}
            disabled={saving}
            className="gap-2 min-w-[200px] shadow-sm"
          >
            <Package className="h-5 w-5" />
            <span>{isEditMode ? 'Update Produce Listing' : 'Publish Listing'}</span>
          </Button>
        </div>
      </motion.form>
    </div>
  );
};

export default AddProduct;
