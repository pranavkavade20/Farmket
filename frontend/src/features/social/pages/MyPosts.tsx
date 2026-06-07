import React, { useState } from 'react';
import { useGetMyPostsQuery } from '../api/socialApi';
import { PostComposer } from '../components/PostComposer';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Heart, MessageCircle, FileText, Image as ImageIcon } from 'lucide-react';

export default function MyPosts() {
  const { data, isLoading } = useGetMyPostsQuery();
  const posts = data?.results || (Array.isArray(data) ? data : []);
  const [editingPost, setEditingPost] = useState<any | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Posts</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your posts and update your community.</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 font-medium">You haven't created any posts yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-4">
          {posts.map((post: any) => {
            const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;
            
            return (
              <motion.div 
                key={post.id}
                whileHover={{ scale: 0.98 }}
                onClick={() => setEditingPost(post)}
                className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer"
              >
                {firstMedia ? (
                  firstMedia.type === 'video' ? (
                    <video src={firstMedia.file} className="w-full h-full object-cover" />
                  ) : (
                    <img src={firstMedia.file} alt={post.title} className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center">
                    <FileText className="h-8 w-8 text-emerald-400 mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 line-clamp-3">
                      {post.description}
                    </p>
                  </div>
                )}
                
                {/* Instagram style overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Heart className="h-6 w-6 fill-white" /> {post.likes_count}
                  </div>
                  <div className="flex items-center gap-2 text-white font-bold">
                    <MessageCircle className="h-6 w-6 fill-white" /> {post.comments_count}
                  </div>
                </div>

                {/* Multi-media indicator */}
                {post.media?.length > 1 && (
                  <div className="absolute top-3 right-3 text-white drop-shadow-md">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingPost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingPost(null);
            }}
          >
            <PostComposer 
              existingPost={editingPost}
              onClose={() => setEditingPost(null)} 
              onSuccess={() => setEditingPost(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
