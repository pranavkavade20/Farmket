import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Image as ImageIcon,
  Video,
  MapPin,
  Tag,
  Package,
  X,
  Check,
  Pin,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useCreatePostMutation, useUpdatePostMutation } from '../api/socialApi';
import { productService } from '@/features/products/services/productService';
import { useAppSelector } from '@/app/hooks';
import type { Post, Product } from '@/types';
import { Button, Badge } from '@/components/ui';
import { MEDIA_BASE_URL } from '@/config/env';
import { toast } from 'sonner';

interface PostComposerProps {
  onSuccess?: () => void;
  onClose?: () => void;
  existingPost?: Post; // For edit mode
}

const resolveMediaUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${MEDIA_BASE_URL}${url}`;
};

export const PostComposer: React.FC<PostComposerProps> = ({
  onSuccess,
  onClose,
  existingPost,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const isLoading = isCreating || isUpdating;

  const [products, setProducts] = useState<Product[]>([]);

  // Pre-fill state if editing
  const [title, setTitle] = useState(existingPost?.title || '');
  const [description, setDescription] = useState(existingPost?.description || '');
  const [location, setLocation] = useState(existingPost?.location || '');
  const [productId, setProductId] = useState<number | string>(existingPost?.product?.id || '');
  const [isPinned, setIsPinned] = useState(existingPost?.is_pinned || false);
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>(existingPost?.hashtags || []);

  // New media files added by user
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; type: 'image' | 'video' }[]>([]);

  // Existing media tracking
  const [existingMedia, setExistingMedia] = useState<
    { id: number; file: string; type: string }[]
  >(existingPost?.media || []);
  const [mediaToDelete, setMediaToDelete] = useState<number[]>([]);

  // Fetch farmer products
  useEffect(() => {
    if (user?.id) {
      productService
        .getProducts({ farmer: user.id })
        .then((res) => setProducts(res.results || []))
        .catch((err) => console.error('Failed to load farmer products', err));
    }
  }, [user?.id]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setMediaFiles((prev) => [...prev, ...filesArray]);

      const newPreviews = filesArray.map((file) => ({
        url: URL.createObjectURL(file),
        type: (file.type.startsWith('video') ? 'video' : 'image') as 'image' | 'video',
      }));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
    e.target.value = '';
  };

  const removeNewFile = (index: number) => {
    if (previews[index]?.url) {
      URL.revokeObjectURL(previews[index].url);
    }
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (mediaId: number) => {
    setExistingMedia((prev) => prev.filter((m) => m.id !== mediaId));
    setMediaToDelete((prev) => [...prev, mediaId]);
  };

  const handleAddHashtag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = hashtagInput.trim().replace(/^#/, '').toLowerCase();
      if (cleaned && !hashtags.includes(cleaned)) {
        setHashtags((prev) => [...prev, cleaned]);
      }
      setHashtagInput('');
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && !title.trim() && mediaFiles.length === 0 && existingMedia.length === 0) {
      toast.error('Please enter a description or upload media before publishing.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('location', location.trim());
    formData.append('is_pinned', String(isPinned));

    if (productId) {
      formData.append('product_id', String(productId));
    } else if (existingPost && !productId) {
      formData.append('product_id', '');
    }

    // Append hashtags as JSON string to support full list updates and empty array clearing
    formData.append('hashtags', JSON.stringify(hashtags));
    if (hashtags.length > 0) {
      hashtags.forEach((tag, idx) => {
        formData.append(`hashtags[${idx}]`, tag);
      });
    }

    mediaFiles.forEach((file, index) => {
      formData.append(`media_${index}`, file);
    });

    if (existingPost && mediaToDelete.length > 0) {
      formData.append('media_to_delete', mediaToDelete.join(','));
    }

    try {
      if (existingPost) {
        await updatePost({ id: existingPost.id, data: formData }).unwrap();
        toast.success('Post updated successfully');
      } else {
        await createPost(formData).unwrap();
        toast.success('Harvest story published to community feed! 🎉');
      }
      onSuccess?.();
      onClose?.();
    } catch (err: unknown) {
      console.error('Failed to save post:', err);
      let errorMsg = 'Failed to publish post. Please check your network and try again.';
      if (err && typeof err === 'object') {
        const errorObj = err as Record<string, any>;
        const data = errorObj.data;
        if (data) {
          if (typeof data.error === 'string') {
            errorMsg = data.error;
          } else if (typeof data.detail === 'string') {
            errorMsg = data.detail;
          } else if (typeof data.error === 'object' && data.error !== null) {
            errorMsg = Object.entries(data.error)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
              .join(' | ');
          } else if (typeof data === 'object') {
            errorMsg = Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
              .join(' | ');
          }
        } else if (errorObj.message) {
          errorMsg = String(errorObj.message);
        }
      }
      toast.error(errorMsg);
    }
  };

  const farmerName =
    user?.first_name || user?.username
      ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
      : 'Farmer';
  const farmerInitials = farmerName.charAt(0).toUpperCase();

  const selectedProduct = products.find((p) => String(p.id) === String(productId));

  return (
    <motion.div
      role="region"
      aria-label={existingPost ? 'Edit Farm Update' : 'Publish Farm Story'}
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 15 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="bg-surface rounded-3xl shadow-2xl border border-border-subtle overflow-hidden max-w-2xl w-full mx-auto max-h-[90vh] flex flex-col"
    >
      {/* Header */}
      <div className="p-5 border-b border-border-subtle flex justify-between items-center bg-surface-elevated/40 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-muted/30 text-brand" aria-hidden="true">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-foreground">
              {existingPost ? 'Edit Farm Update' : 'Publish Farm Story'}
            </h2>
            <p className="text-xs text-muted">
              Share real-time crop milestones and harvest announcements
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-muted hover:text-foreground hover:bg-surface-elevated transition-colors focus-ring"
            aria-label="Close composer"
          >
            <X size={20} aria-hidden="true" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
        {/* Author Strip */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-brand text-on-brand flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0" aria-hidden="true">
            {farmerInitials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-foreground">{farmerName}</span>
              <Badge variant="success" size="sm" icon={<ShieldCheck className="h-3 w-3 stroke-[2.2]" aria-hidden="true" />} className="py-0 text-[10px]">
                <span>Verified Producer</span>
              </Badge>
            </div>
            <p className="text-[11px] text-muted">Posting publicly to Farmket Community</p>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <input
            type="text"
            placeholder="Post Title (e.g. Fresh Organic Tomatoes Harvest This Week)"
            aria-label="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent border-b border-border-subtle pb-2 text-base sm:text-lg font-bold placeholder:text-muted focus:outline-none focus:border-brand text-foreground transition-colors"
          />
        </div>

        {/* Description Textarea */}
        <div>
          <textarea
            placeholder="What are you harvesting or preparing on the farm today? Describe the yield, soil condition, or expected availability..."
            aria-label="Post Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-surface-elevated/40 border border-border-subtle rounded-2xl p-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none leading-relaxed transition-all"
          />
        </div>

        {/* Hashtags Input & Chips */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag size={15} className="text-muted flex-shrink-0" aria-hidden="true" />
            <input
              type="text"
              placeholder="Add hashtags (press Enter or comma, e.g. organic, wheat, farmfresh)"
              aria-label="Add hashtags"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={handleAddHashtag}
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted focus:outline-none"
            />
          </div>

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-muted/20 text-brand text-xs font-bold border border-brand/20"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeHashtag(tag)}
                    className="hover:text-danger ml-0.5 focus-ring rounded"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Media Preview Tray */}
        {(existingMedia.length > 0 || previews.length > 0) && (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">
              Attached Media ({existingMedia.length + previews.length})
            </span>

            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {/* Existing Media */}
              {existingMedia.map((media) => (
                <div
                  key={`existing-${media.id}`}
                  className="relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden group border border-border-subtle bg-black"
                >
                  {media.type === 'video' ? (
                    <video src={resolveMediaUrl(media.file)} className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={resolveMediaUrl(media.file)}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingFile(media.id)}
                    className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-danger text-white p-1 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 focus-ring transition-opacity"
                    title="Remove media"
                    aria-label="Remove attached media"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}

              {/* Newly Staged Previews */}
              {previews.map((preview, i) => (
                <div
                  key={`new-${i}`}
                  className="relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden group border border-border-subtle bg-black"
                >
                  {preview.type === 'video' ? (
                    <video src={preview.url} className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={preview.url}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeNewFile(i)}
                    className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-danger text-white p-1 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 focus-ring transition-opacity"
                    title="Remove media"
                    aria-label="Remove attached media"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pin Produce & Location Settings Box */}
        <div className="bg-surface-elevated/70 rounded-2xl p-4 sm:p-5 space-y-4 border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Package size={15} className="text-brand" aria-hidden="true" />
              <span>Link Harvest Produce (Optional)</span>
            </span>
            {selectedProduct && (
              <Badge variant="brand" size="sm">
                ₹{selectedProduct.price} / {selectedProduct.unit || 'kg'}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Product Selector */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted" aria-hidden="true">
                <Package size={16} />
              </div>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                aria-label="Link Harvest Produce"
                className="pl-9 w-full rounded-xl border border-border-subtle bg-surface py-2.5 text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
              >
                <option value="">Select produce from your farm...</option>
                {products.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} (₹{prod.price}/{prod.unit || 'kg'})
                  </option>
                ))}
              </select>
            </div>

            {/* Farm Location */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted" aria-hidden="true">
                <MapPin size={16} />
              </div>
              <input
                type="text"
                placeholder="Farm Location (e.g. Pune, MH)"
                aria-label="Farm Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-9 w-full rounded-xl border border-border-subtle bg-surface py-2.5 text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>
          </div>

          {/* Pinned to Top Switch */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="h-4 w-4 rounded-md border-border-subtle text-brand focus:ring-brand"
            />
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Pin size={13} className={isPinned ? 'text-brand rotate-45' : 'text-muted'} aria-hidden="true" />
              <span>Pin this announcement to top of your profile</span>
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
          {/* Media Attach Triggers */}
          <div className="flex items-center gap-1.5">
            <label
              className="p-2 text-brand hover:bg-brand-muted/20 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-bold focus-within:ring-2 focus-within:ring-brand"
              title="Add Photos"
            >
              <ImageIcon size={18} aria-hidden="true" />
              <span className="hidden sm:inline">Add Photo</span>
              <input
                type="file"
                multiple
                accept="image/*"
                aria-label="Upload photos"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            <label
              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-bold focus-within:ring-2 focus-within:ring-brand"
              title="Add Video"
            >
              <Video size={18} aria-hidden="true" />
              <span className="hidden sm:inline">Add Video</span>
              <input
                type="file"
                multiple
                accept="video/*"
                aria-label="Upload videos"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-2">
            {onClose && (
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="brand"
              size="sm"
              disabled={isLoading || (!description.trim() && !title.trim())}
              isLoading={isLoading}
              leftIcon={!isLoading ? <Check size={16} /> : undefined}
            >
              {existingPost ? 'Save Changes' : 'Publish Story'}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};
