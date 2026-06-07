import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Video, FileText, MapPin, Tag, Package, X, Check } from 'lucide-react';
import { useCreatePostMutation, useUpdatePostMutation } from '../api/socialApi';
import { productService } from '@/features/products/services/productService';
import { useAppSelector } from '@/app/hooks';

interface PostComposerProps {
  onSuccess?: () => void;
  onClose?: () => void;
  existingPost?: any; // For edit mode
}

export const PostComposer: React.FC<PostComposerProps> = ({ onSuccess, onClose, existingPost }) => {
  const { user } = useAppSelector(state => state.auth);
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const isLoading = isCreating || isUpdating;

  const [products, setProducts] = useState<any[]>([]);

  // Pre-fill state if editing
  const [title, setTitle] = useState(existingPost?.title || '');
  const [description, setDescription] = useState(existingPost?.description || '');
  const [location, setLocation] = useState(existingPost?.location || '');
  const [productId, setProductId] = useState(existingPost?.product?.id || '');
  
  // New media files added by user
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  // Existing media tracking
  const [existingMedia, setExistingMedia] = useState<any[]>(existingPost?.media || []);
  const [mediaToDelete, setMediaToDelete] = useState<number[]>([]);

  useEffect(() => {
    if (user?.id) {
      productService.getProducts({ farmer: user.id })
        .then(res => setProducts(res.results || []))
        .catch(err => console.error('Failed to load products', err));
    }
  }, [user?.id]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setMediaFiles(prev => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (mediaId: number) => {
    setExistingMedia(prev => prev.filter(m => m.id !== mediaId));
    setMediaToDelete(prev => [...prev, mediaId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location);
    if (productId) formData.append('product_id', productId);
    
    // For updates, passing empty product_id removes it.
    if (existingPost && !productId) {
      formData.append('product_id', '');
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
      } else {
        await createPost(formData).unwrap();
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error('Failed to save post:', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden max-w-2xl w-full mx-auto max-h-[90vh] flex flex-col"
    >
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{existingPost ? 'Edit Post' : 'Create New Post'}</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
        {/* Main Content Area */}
        <div className="flex gap-4 items-start">
          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex-shrink-0 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
            You
          </div>
          <div className="flex-1 space-y-4">
            <input 
              type="text" 
              placeholder="Post Title (optional)" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-none text-lg font-semibold placeholder-gray-400 focus:ring-0 p-0 text-gray-900 dark:text-white"
            />
            <textarea 
              placeholder="What are you harvesting today?" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent border-none resize-none placeholder-gray-400 focus:ring-0 p-0 text-gray-700 dark:text-gray-300 min-h-[100px]"
            />
          </div>
        </div>

        {/* Media Previews */}
        {(existingMedia.length > 0 || previews.length > 0) && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {existingMedia.map((media: any) => (
              <div key={`existing-${media.id}`} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden group">
                {media.type === 'video' ? (
                  <video src={media.file} className="w-full h-full object-cover" />
                ) : (
                  <img src={media.file} alt="preview" className="w-full h-full object-cover" />
                )}
                <button 
                  type="button"
                  onClick={() => removeExistingFile(media.id)}
                  className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {previews.map((preview, i) => (
              <div key={`new-${i}`} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden group">
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pin Product Details */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4 border border-gray-100 dark:border-gray-700/50">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Pin Your Product (Optional)</h3>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Package size={16} className="text-gray-400" />
            </div>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="pl-9 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-gray-700 dark:text-gray-200"
            >
              <option value="">Select a product to pin...</option>
              {products.map((prod: any) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} ({prod.market_state?.replace(/_/g, ' ') || 'Ready'}) - ₹{prod.price}
                </option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin size={16} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Location" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-9 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <label className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full cursor-pointer transition-colors">
              <ImageIcon size={22} />
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            <label className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full cursor-pointer transition-colors">
              <Video size={22} />
              <input type="file" multiple accept="video/*" className="hidden" onChange={handleFileChange} />
            </label>
            <button type="button" className="p-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-full transition-colors">
              <Tag size={22} />
            </button>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || !description}
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white px-6 py-2 rounded-full font-semibold shadow-md flex items-center gap-2"
          >
            {isLoading ? 'Posting...' : <><Check size={18} /> Post</>}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};
