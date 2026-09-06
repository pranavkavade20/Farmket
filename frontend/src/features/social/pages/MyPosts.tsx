import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGetMyPostsQuery, useDeletePostMutation } from '../api/socialApi';
import { PostComposer } from '../components/PostComposer';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ExternalLink,
  Heart,
  MessageCircle,
  ShoppingBag,
  Layers,
  Video as VideoIcon,
  Search,
  LayoutGrid,
  List,
  Trash2,
  Edit3,
  Calendar,
  Sprout,
  Sparkles,
  FileText,
  Pin
} from 'lucide-react';
import { Button, Badge, EmptyState } from '@/components/ui';
import { useSEO } from '@/hooks';
import { toast } from 'sonner';
import type { Post } from '@/types';

type FilterType = 'ALL' | 'PHOTO' | 'VIDEO' | 'COMMERCE';
type ViewMode = 'grid' | 'feed';

export default function MyPosts() {
  useSEO({
    title: 'My Posts — Community',
    description: 'Manage your farm stories, updates, and community engagement.'
  });

  const { data, isLoading } = useGetMyPostsQuery();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  const posts: Post[] = useMemo(() => {
    return (data?.results || (Array.isArray(data) ? data : [])) as Post[];
  }, [data]);

  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Compute stats across all user posts
  const stats = useMemo(() => {
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
    const linkedProducts = posts.filter(p => !!p.product).length;

    return {
      totalPosts: posts.length,
      totalLikes,
      totalComments,
      linkedProducts
    };
  }, [posts]);

  // Filtered posts based on search & media filter
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch =
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.hashtags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesType = true;
      if (activeFilter === 'PHOTO') {
        matchesType = !!post.media?.some(m => m.type === 'image');
      } else if (activeFilter === 'VIDEO') {
        matchesType = !!post.media?.some(m => m.type === 'video');
      } else if (activeFilter === 'COMMERCE') {
        matchesType = !!post.product;
      }

      return matchesSearch && matchesType;
    });
  }, [posts, searchQuery, activeFilter]);

  const handleDelete = async (postId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      return;
    }

    try {
      await deletePost(postId).unwrap();
      toast.success('Post deleted successfully');
    } catch {
      toast.error('Failed to delete post. Please try again.');
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="mx-auto max-w-7xl w-full pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Farm Stories
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
            Community Posts
          </h1>
          <p className="text-sm font-medium text-foreground-secondary mt-1">
            Publish harvest updates, connect with buyers, and showcase your farming journey.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link to="/feed">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <ExternalLink className="w-4 h-4" />
              <span>Public Feed</span>
            </Button>
          </Link>
          <Button
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 w-full sm:w-auto shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4" />
            <span>New Post</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl bg-surface border border-border-subtle p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
              Total Posts
            </span>
            <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-foreground leading-none">
            {isLoading ? '—' : stats.totalPosts}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-surface border border-border-subtle p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
              Total Likes
            </span>
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-foreground leading-none">
            {isLoading ? '—' : stats.totalLikes}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-surface border border-border-subtle p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
              Discussions
            </span>
            <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center text-info">
              <MessageCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-foreground leading-none">
            {isLoading ? '—' : stats.totalComments}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-surface border border-border-subtle p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
              Tagged Harvests
            </span>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-foreground leading-none">
            {isLoading ? '—' : stats.linkedProducts}
          </p>
        </motion.div>
      </div>

      {/* Control Bar: Search, Category Filters, and View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-brand transition-colors" />
            <input
              type="text"
              placeholder="Search by title, caption, #hashtag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border-strong rounded-xl text-sm font-medium text-foreground placeholder-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 shadow-sm transition-all"
            />
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 bg-surface border border-border-subtle p-1 rounded-xl shadow-sm">
            {(
              [
                { key: 'ALL', label: 'All' },
                { key: 'PHOTO', label: 'Photos' },
                { key: 'VIDEO', label: 'Videos' },
                { key: 'COMMERCE', label: 'Harvests' },
              ] as { key: FilterType; label: string }[]
            ).map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === filter.key
                    ? 'bg-brand text-brand-foreground shadow-sm'
                    : 'text-foreground-secondary hover:text-foreground hover:bg-state-hover'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-surface border border-border-subtle p-1 rounded-xl shadow-sm self-end sm:self-auto shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-surface-elevated text-brand shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
            title="Grid View"
            aria-label="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('feed')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'feed'
                ? 'bg-surface-elevated text-brand shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
            title="List View"
            aria-label="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl bg-surface border border-border-subtle p-4 flex flex-col justify-between animate-pulse"
            >
              <div className="h-4 w-1/2 bg-border-subtle rounded" />
              <div className="h-8 w-8 rounded-full bg-border-subtle self-center" />
              <div className="h-3 w-3/4 bg-border-subtle rounded" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<Sprout className="w-12 h-12 text-muted" />}
          title="No posts published yet"
          description="Start sharing real-time harvest stories and announcements with buyers in your community."
          action={{
            label: 'Create Your First Post',
            onClick: () => setIsCreateOpen(true)
          }}
        />
      ) : filteredPosts.length === 0 ? (
        <EmptyState
          icon={<Search className="w-10 h-10 text-muted" />}
          title="No matching posts found"
          description="Try changing your search keywords or switching your filter criteria."
          action={{
            label: 'Clear Filters',
            onClick: () => {
              setSearchQuery('');
              setActiveFilter('ALL');
            }
          }}
        />
      ) : viewMode === 'grid' ? (
        /* Top-Tech Grid Layout */
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPosts.map((post) => {
            const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;
            const hasMultipleMedia = (post.media?.length || 0) > 1;
            const isVideo = firstMedia?.type === 'video';

            return (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => setEditingPost(post)}
                className="group relative aspect-square rounded-2xl bg-surface border border-border-subtle overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Media or Text Backdrop */}
                {firstMedia ? (
                  isVideo ? (
                    <video
                      src={firstMedia.file}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <img
                      src={firstMedia.file}
                      alt={post.title || 'Farm story'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex flex-col justify-between p-5 bg-gradient-to-br from-surface to-surface-elevated">
                    <div className="flex items-center gap-2 text-brand">
                      <FileText className="w-5 h-5" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Update</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground line-clamp-4 leading-relaxed">
                      {post.description}
                    </p>
                    <div className="text-[11px] font-medium text-muted">
                      {formatDate(post.created_at)}
                    </div>
                  </div>
                )}

                {/* Top Badges */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                  <div className="flex items-center gap-1.5">
                    {post.is_pinned && (
                      <span className="bg-brand text-brand-foreground px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                    {post.product && (
                      <span className="bg-surface/90 backdrop-blur-md text-foreground border border-border-subtle px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <ShoppingBag className="w-3 h-3 text-brand" /> ₹{post.product.price}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {isVideo && (
                      <span className="bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <VideoIcon className="w-3 h-3" />
                      </span>
                    )}
                    {hasMultipleMedia && (
                      <span className="bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <Layers className="w-3 h-3" /> {post.media.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Top-Right Quick Action Hover Bar */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 flex items-center gap-1.5 pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPost(post);
                    }}
                    className="h-8 w-8 rounded-full bg-surface/90 backdrop-blur-md border border-border-subtle flex items-center justify-center text-foreground hover:text-brand hover:scale-105 transition-all shadow-sm"
                    title="Edit Post"
                    aria-label="Edit Post"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(post.id, e)}
                    disabled={isDeleting}
                    className="h-8 w-8 rounded-full bg-surface/90 backdrop-blur-md border border-border-subtle flex items-center justify-center text-danger hover:bg-danger hover:text-white hover:scale-105 transition-all shadow-sm"
                    title="Delete Post"
                    aria-label="Delete Post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bottom Glassmorphic Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 flex flex-col justify-end text-white z-10 transition-all duration-300">
                  {post.title && (
                    <h3 className="text-sm font-bold truncate drop-shadow-sm mb-1">
                      {post.title}
                    </h3>
                  )}
                  <div className="flex items-center justify-between text-xs font-semibold text-white/90">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 fill-white/80" /> {post.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 fill-white/80" /> {post.comments_count}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/70">
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Top-Tech List / Feed Layout */
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;

            return (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-surface border border-border-subtle p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 items-start"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => setEditingPost(post)}
                  className="relative w-full sm:w-44 aspect-video sm:aspect-square rounded-xl bg-surface-elevated overflow-hidden shrink-0 cursor-pointer group"
                >
                  {firstMedia ? (
                    firstMedia.type === 'video' ? (
                      <video src={firstMedia.file} className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={firstMedia.file}
                        alt={post.title || 'Post thumbnail'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand/5 text-brand">
                      <Sprout className="w-8 h-8 opacity-60" />
                    </div>
                  )}

                  {firstMedia?.type === 'video' && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                      <VideoIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {post.is_pinned && (
                        <Badge variant="success" size="sm">
                          Pinned
                        </Badge>
                      )}
                      <span className="text-xs font-medium text-muted flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(post.created_at)}
                      </span>
                      {post.location && (
                        <span className="text-xs font-medium text-muted flex items-center gap-1">
                          • {post.location}
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => setEditingPost(post)}
                      className="text-lg font-bold text-foreground hover:text-brand transition-colors cursor-pointer"
                    >
                      {post.title || 'Farm Update'}
                    </h3>

                    <p className="text-sm text-foreground-secondary mt-1 line-clamp-2 leading-relaxed">
                      {post.description}
                    </p>

                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {post.hashtags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Commerce Attachment & Actions Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-border-subtle">
                    {post.product ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-foreground bg-surface-elevated px-3 py-1.5 rounded-xl border border-border-subtle">
                        <ShoppingBag className="w-4 h-4 text-brand" />
                        <span>{post.product.name}</span>
                        <span className="text-brand font-bold">₹{post.product.price}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 text-xs font-semibold text-foreground-secondary">
                        <span className="flex items-center gap-1.5">
                          <Heart className="w-4 h-4 text-red-500" /> {post.likes_count} likes
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4 text-info" /> {post.comments_count} comments
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPost(post)}
                        className="gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(post.id, e)}
                        className="text-danger hover:bg-danger/10 gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Composer Modal (For both Create and Edit) */}
      <AnimatePresence>
        {(isCreateOpen || editingPost) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsCreateOpen(false);
                setEditingPost(null);
              }
            }}
          >
            <PostComposer
              existingPost={editingPost || undefined}
              onClose={() => {
                setIsCreateOpen(false);
                setEditingPost(null);
              }}
              onSuccess={() => {
                setIsCreateOpen(false);
                setEditingPost(null);
                toast.success(editingPost ? 'Post updated successfully' : 'Post created successfully! 🎉');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
