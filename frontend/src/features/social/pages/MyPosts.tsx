import React, { useState, useMemo } from 'react';
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
  FileText,
  Pin,
  X,
  Sparkles,
} from 'lucide-react';
import { Button, Badge, EmptyState, PageHeader, ConfirmDialog, Skeleton } from '@/components/ui';
import { useSEO } from '@/hooks';
import { toast } from 'sonner';
import type { Post } from '@/types';
import { MEDIA_BASE_URL } from '@/config/env';

type FilterType = 'ALL' | 'PHOTO' | 'VIDEO' | 'COMMERCE';
type ViewMode = 'grid' | 'feed';

const resolveMediaUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${MEDIA_BASE_URL}${url}`;
};

const formatDate = (isoString: string) => {
  try {
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
};

export default function MyPosts() {
  useSEO({
    title: 'My Published Updates | Farmket Community',
    description: 'Manage your farm updates, customer interactions, and community engagement.',
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

  // Delete modal state
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  // Compute stats across all user posts
  const stats = useMemo(() => {
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
    const linkedProducts = posts.filter((p) => Boolean(p.product)).length;

    return {
      totalPosts: posts.length,
      totalLikes,
      totalComments,
      linkedProducts,
    };
  }, [posts]);

  // Filtered posts based on search & media filter
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title?.toLowerCase().includes(q) ||
        post.description?.toLowerCase().includes(q) ||
        post.hashtags?.some((tag) => tag.toLowerCase().includes(q));

      let matchesType = true;
      if (activeFilter === 'PHOTO') {
        matchesType = Boolean(post.media?.some((m) => m.type === 'image'));
      } else if (activeFilter === 'VIDEO') {
        matchesType = Boolean(post.media?.some((m) => m.type === 'video'));
      } else if (activeFilter === 'COMMERCE') {
        matchesType = Boolean(post.product);
      }

      return matchesSearch && matchesType;
    });
  }, [posts, searchQuery, activeFilter]);

  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      await deletePost(postToDelete.id).unwrap();
      toast.success('Post removed from community feed');
      setPostToDelete(null);
    } catch {
      toast.error('Failed to delete post. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl w-full pb-20 space-y-8">
      {/* Standardized PageHeader */}
      <PageHeader
        title="Community Stories & Updates"
        description="Publish crop lifecycle milestones, harvest dates, and transparent agricultural updates to local buyers."
        badge={
          <Badge variant="brand" className="gap-1.5 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Farmer Storyboard</span>
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link to="/feed">
              <Button variant="outline" size="sm" leftIcon={<ExternalLink className="h-4 w-4" />}>
                Public Feed
              </Button>
            </Link>
            <Button
              variant="brand"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              New Story
            </Button>
          </div>
        }
      />

      {/* KPI Performance Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Posts */}
        <div className="rounded-3xl bg-surface border border-border-subtle p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              Total Stories
            </span>
            <div className="h-10 w-10 rounded-2xl bg-brand-muted/30 flex items-center justify-center text-brand">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
            {isLoading ? <Skeleton className="h-8 w-16" /> : stats.totalPosts}
          </div>
        </div>

        {/* Total Likes */}
        <div className="rounded-3xl bg-surface border border-border-subtle p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              Community Likes
            </span>
            <div className="h-10 w-10 rounded-2xl bg-danger/10 flex items-center justify-center text-danger">
              <Heart className="w-5 h-5 fill-danger" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
            {isLoading ? <Skeleton className="h-8 w-16" /> : stats.totalLikes}
          </div>
        </div>

        {/* Total Comments */}
        <div className="rounded-3xl bg-surface border border-border-subtle p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              Discussions
            </span>
            <div className="h-10 w-10 rounded-2xl bg-info/10 flex items-center justify-center text-info">
              <MessageCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
            {isLoading ? <Skeleton className="h-8 w-16" /> : stats.totalComments}
          </div>
        </div>

        {/* Linked Produce */}
        <div className="rounded-3xl bg-surface border border-border-subtle p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              Tagged Harvests
            </span>
            <div className="h-10 w-10 rounded-2xl bg-warning/10 flex items-center justify-center text-warning">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
            {isLoading ? <Skeleton className="h-8 w-16" /> : stats.linkedProducts}
          </div>
        </div>
      </div>

      {/* Control Bar: Search Input, Category Filter Chips, View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, description, #hashtag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-surface border border-border-subtle rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted hover:text-foreground rounded-full"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1 bg-surface-elevated/70 border border-border-subtle p-1 rounded-2xl shadow-2xs">
            {(
              [
                { key: 'ALL', label: 'All Stories' },
                { key: 'PHOTO', label: 'Photos' },
                { key: 'VIDEO', label: 'Videos' },
                { key: 'COMMERCE', label: 'Harvests' },
              ] as { key: FilterType; label: string }[]
            ).map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === filter.key
                    ? 'bg-brand text-on-brand shadow-xs'
                    : 'text-foreground-secondary hover:text-foreground hover:bg-surface'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Switcher: Grid vs Feed/List */}
        <div className="flex items-center gap-1 bg-surface-elevated/70 border border-border-subtle p-1 rounded-2xl self-end sm:self-auto shrink-0 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-all ${
              viewMode === 'grid'
                ? 'bg-surface text-brand shadow-xs'
                : 'text-muted hover:text-foreground'
            }`}
            title="Grid View"
            aria-label="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('feed')}
            className={`p-2 rounded-xl transition-all ${
              viewMode === 'feed'
                ? 'bg-surface text-brand shadow-xs'
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
              className="aspect-square rounded-3xl bg-surface border border-border-subtle p-4 flex flex-col justify-between"
            >
              <Skeleton className="h-4 w-1/2 rounded-md" />
              <Skeleton className="h-12 w-12 rounded-full self-center" />
              <Skeleton className="h-3 w-3/4 rounded-md" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="No farm updates published yet"
          description="Share your first crop lifecycle milestone, harvest schedule, or farming announcement to connect with local buyers."
          action={
            <Button
              variant="brand"
              onClick={() => setIsCreateOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Publish First Story
            </Button>
          }
        />
      ) : filteredPosts.length === 0 ? (
        <EmptyState
          title="No matching posts found"
          description={`No updates match "${searchQuery}". Try searching with different keywords or reset your filter.`}
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('ALL');
              }}
            >
              Clear Filters
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        /* Top-Tech Grid Layout */
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredPosts.map((post) => {
            const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;
            const hasMultipleMedia = (post.media?.length || 0) > 1;
            const isVideo = firstMedia?.type === 'video';

            return (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.18 }}
                onClick={() => setEditingPost(post)}
                className="group relative aspect-square rounded-3xl bg-surface border border-border-subtle overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col select-none"
              >
                {/* Media or Text Backdrop */}
                {firstMedia ? (
                  isVideo ? (
                    <video
                      src={resolveMediaUrl(firstMedia.file)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <img
                      src={resolveMediaUrl(firstMedia.file)}
                      alt={post.title || 'Farm update'}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex flex-col justify-between p-5 bg-gradient-to-br from-surface to-surface-elevated">
                    <div className="flex items-center gap-2 text-brand">
                      <FileText className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Story</span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-foreground line-clamp-4 leading-relaxed">
                      {post.description}
                    </p>
                    <div className="text-[10px] font-bold text-muted">
                      {formatDate(post.created_at)}
                    </div>
                  </div>
                )}

                {/* Top Overlay Badges */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {post.is_pinned && (
                      <span className="bg-brand text-on-brand px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <Pin className="w-3 h-3 rotate-45" /> Pinned
                      </span>
                    )}
                    {post.product && (
                      <span className="bg-surface/90 backdrop-blur-md text-foreground border border-border-subtle px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs">
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
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPost(post);
                    }}
                    className="h-8 w-8 rounded-full bg-surface/90 backdrop-blur-md border border-border-subtle flex items-center justify-center text-foreground hover:text-brand hover:scale-105 transition-all shadow-xs"
                    title="Edit Post"
                    aria-label="Edit Post"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPostToDelete(post);
                    }}
                    disabled={isDeleting}
                    className="h-8 w-8 rounded-full bg-surface/90 backdrop-blur-md border border-border-subtle flex items-center justify-center text-danger hover:bg-danger hover:text-white hover:scale-105 transition-all shadow-xs"
                    title="Delete Post"
                    aria-label="Delete Post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bottom Glassmorphic Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3.5 sm:p-4 flex flex-col justify-end text-white z-10 transition-all duration-300">
                  {post.title && (
                    <h3 className="text-xs sm:text-sm font-bold truncate drop-shadow-xs mb-1">
                      {post.title}
                    </h3>
                  )}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-white/90">
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
                className="rounded-3xl bg-surface border border-border-subtle p-5 shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row gap-5 items-start"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => setEditingPost(post)}
                  className="relative w-full sm:w-44 aspect-video sm:aspect-square rounded-2xl bg-surface-elevated overflow-hidden shrink-0 cursor-pointer group"
                >
                  {firstMedia ? (
                    firstMedia.type === 'video' ? (
                      <video
                        src={resolveMediaUrl(firstMedia.file)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={resolveMediaUrl(firstMedia.file)}
                        alt={post.title || 'Post thumbnail'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-muted/20 text-brand">
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
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full w-full">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {post.is_pinned && (
                        <Badge variant="brand" size="sm" className="gap-1">
                          <Pin className="h-3 w-3 rotate-45" />
                          <span>Pinned</span>
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
                      className="text-base sm:text-lg font-bold text-foreground hover:text-brand transition-colors cursor-pointer"
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
                            className="text-[11px] font-bold text-brand bg-brand-muted/20 px-2 py-0.5 rounded-full border border-brand/20"
                          >
                            #{tag.replace(/^#/, '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Commerce Attachment & Actions Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-border-subtle">
                    {post.product ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-foreground bg-surface-elevated px-3 py-1.5 rounded-xl border border-border-subtle">
                        <ShoppingBag className="w-4 h-4 text-brand" />
                        <span>{post.product.name}</span>
                        <span className="text-brand font-black">₹{post.product.price}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 text-xs font-semibold text-foreground-secondary">
                        <span className="flex items-center gap-1.5">
                          <Heart className="w-4 h-4 text-danger fill-danger" /> {post.likes_count} likes
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
                        leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPostToDelete(post)}
                        className="text-danger hover:bg-danger/10"
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        Delete
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
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
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
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(postToDelete)}
        onClose={() => setPostToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Farm Post"
        description="Are you sure you want to delete this update? This action cannot be undone and will permanently remove this story and its comments from the community feed."
        confirmLabel="Delete Post"
        cancelLabel="Keep Story"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
