import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { 
  MessageSquare, 
  Send, 
  Bell, 
  Calendar, 
  Users, 
  ThumbsUp, 
  Heart,
  Smile,
  AlertCircle,
  Search,
  X,
  Pin,
  MoreVertical,
  Edit2,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Announcement } from '../../types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface StaffCommunicationProps {
  announcements: Announcement[];
  userName: string;
  userId: string;
  onPostAnnouncement: (announcement: Partial<Announcement>) => void;
  onReact: (announcementId: string, userId: string, reaction: string) => void;
  onAddComment: (announcementId: string, userId: string, userName: string, text: string) => void;
}

export function StaffCommunication({
  announcements,
  userName,
  userId,
  onPostAnnouncement,
  onReact,
  onAddComment,
}: StaffCommunicationProps) {
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'announcement' | 'event' | 'shift-update' | 'general'>('general');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCommentInput, setShowCommentInput] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [pinnedPosts, setPinnedPosts] = useState<Set<string>>(new Set(['1'])); // Pin first post by default

  // Filter and search announcements
  const filteredAnnouncements = useMemo(() => {
    let filtered = announcements;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.type === filterType);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query) || 
        a.content.toLowerCase().includes(query) ||
        a.authorName.toLowerCase().includes(query)
      );
    }

    // Sort: pinned first, then by date
    return filtered.sort((a, b) => {
      const aPinned = pinnedPosts.has(a.id);
      const bPinned = pinnedPosts.has(b.id);
      
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [announcements, filterType, searchQuery, pinnedPosts]);

  const handlePost = () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    onPostAnnouncement({
      title,
      content,
      type,
      authorId: userId,
      authorName: userName,
      date: new Date().toISOString(),
    });

    setTitle('');
    setContent('');
    setType('general');
    setShowComposer(false);
    toast.success('Post published successfully');
  };

  const handleAddCommentClick = (announcementId: string) => {
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    onAddComment(announcementId, userId, userName, commentText);
    toast.success('Comment added');
    setCommentText('');
    setShowCommentInput(null);
  };

  const togglePin = (announcementId: string) => {
    setPinnedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(announcementId)) {
        newSet.delete(announcementId);
        toast.success('Post unpinned');
      } else {
        newSet.add(announcementId);
        toast.success('Post pinned to top');
      }
      return newSet;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Bell className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'shift-update': return <Users className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      announcement: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Announcement' },
      event: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Event' },
      'shift-update': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Shift Update' },
      general: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'General' },
    };
    const badge = badges[type as keyof typeof badges] || badges.general;
    return (
      <Badge className={`${badge.bg} ${badge.text}`}>
        {getTypeIcon(type)}
        <span className="ml-1">{badge.label}</span>
      </Badge>
    );
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'like': return <ThumbsUp className="w-4 h-4" />;
      case 'heart': return <Heart className="w-4 h-4" />;
      case 'smile': return <Smile className="w-4 h-4" />;
      default: return <ThumbsUp className="w-4 h-4" />;
    }
  };

  const hasUserReacted = (announcement: Announcement) => {
    return announcement.reactions?.some(r => r.userId === userId) || false;
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffMs = now.getTime() - posted.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return posted.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl">Staff Communication Hub</h2>
          <p className="text-gray-500 mt-1">
            Share announcements, updates, and connect with your team
          </p>
        </div>
        <Button
          onClick={() => setShowComposer(!showComposer)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {showComposer ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              New Post
            </>
          )}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Posts</p>
                <p className="text-2xl mt-1">{announcements.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Announcements</p>
                <p className="text-2xl mt-1">
                  {announcements.filter(a => a.type === 'announcement').length}
                </p>
              </div>
              <Bell className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Events</p>
                <p className="text-2xl mt-1">
                  {announcements.filter(a => a.type === 'event').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-amber-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Shift Updates</p>
                <p className="text-2xl mt-1">
                  {announcements.filter(a => a.type === 'shift-update').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Post Composer */}
      {showComposer && (
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              Create New Post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm">Post Type *</label>
                <Select value={type} onValueChange={(value: any) => setType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        General
                      </div>
                    </SelectItem>
                    <SelectItem value="announcement">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Announcement
                      </div>
                    </SelectItem>
                    <SelectItem value="event">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Event
                      </div>
                    </SelectItem>
                    <SelectItem value="shift-update">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Shift Update
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm">Posted By</label>
                <Input value={userName} disabled className="bg-gray-50" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm">Title *</label>
              <Input
                placeholder="Enter a clear and descriptive title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Content *</label>
              <Textarea
                placeholder="Write your message here. Be clear and concise..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                {content.length} characters
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                onClick={handlePost} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!title.trim() || !content.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Publish Post
              </Button>
              <Button 
                onClick={() => {
                  setShowComposer(false);
                  setTitle('');
                  setContent('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search posts by title, content, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">Filter by:</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="announcement">Announcements</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                  <SelectItem value="shift-update">Shift Updates</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center gap-4">
                {searchQuery ? (
                  <>
                    <Search className="w-16 h-16 text-gray-300" />
                    <div>
                      <h3 className="text-lg mb-1">No posts found</h3>
                      <p className="text-gray-500">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterType('all');
                      }}
                      variant="outline"
                    >
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-16 h-16 text-gray-300" />
                    <div>
                      <h3 className="text-lg mb-1">No posts yet</h3>
                      <p className="text-gray-500">
                        Be the first to share something with the team!
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowComposer(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Create First Post
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map(announcement => {
            const isPinned = pinnedPosts.has(announcement.id);
            const userReacted = hasUserReacted(announcement);
            const reactionCount = announcement.reactions?.length || 0;
            const commentCount = announcement.comments?.length || 0;

            return (
              <Card 
                key={announcement.id}
                className={isPinned ? 'border-blue-300 shadow-md' : ''}
              >
                <CardContent className="pt-6">
                  {/* Pinned indicator */}
                  {isPinned && (
                    <div className="flex items-center gap-2 mb-3 text-blue-600 text-sm">
                      <Pin className="w-4 h-4" />
                      <span>Pinned Post</span>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {announcement.authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-medium">{announcement.authorName}</span>
                            {getTypeBadge(announcement.type)}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{formatRelativeTime(announcement.date)}</span>
                            <span>•</span>
                            <span>{new Date(announcement.date).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => togglePin(announcement.id)}>
                              <Pin className="w-4 h-4 mr-2" />
                              {isPinned ? 'Unpin Post' : 'Pin Post'}
                            </DropdownMenuItem>
                            {announcement.authorId === userId && (
                              <>
                                <DropdownMenuItem>
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Edit Post
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Post
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg mb-2">{announcement.title}</h3>

                      {/* Content */}
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">
                        {announcement.content}
                      </p>

                      <Separator className="my-4" />

                      {/* Reactions and Comments Bar */}
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-4">
                          {reactionCount > 0 && (
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4 text-blue-600" />
                              <span>{reactionCount} {reactionCount === 1 ? 'reaction' : 'reactions'}</span>
                            </div>
                          )}
                        </div>
                        {commentCount > 0 && (
                          <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
                        )}
                      </div>

                      <Separator className="mb-3" />

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={userReacted ? "default" : "ghost"}
                          onClick={() => onReact(announcement.id, userId, 'like')}
                          className={userReacted ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50 hover:text-blue-600'}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {userReacted ? 'Liked' : 'Like'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowCommentInput(
                            showCommentInput === announcement.id ? null : announcement.id
                          )}
                          className="hover:bg-gray-100"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Comment
                        </Button>
                      </div>

                      {/* Comment Input */}
                      {showCommentInput === announcement.id && (
                        <div className="mt-4 flex gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Textarea
                              placeholder="Write a comment..."
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              rows={2}
                              className="mb-2 resize-none"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAddCommentClick(announcement.id)}
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={!commentText.trim()}
                              >
                                Post Comment
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setShowCommentInput(null);
                                  setCommentText('');
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Comments List */}
                      {announcement.comments && announcement.comments.length > 0 && (
                        <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                          {announcement.comments.map((comment, idx) => (
                            <div key={idx} className="flex gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                                  {comment.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm">{comment.userName}</span>
                                    <span className="text-xs text-gray-500">
                                      {formatRelativeTime(comment.date)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">{comment.text}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Load More / Pagination could go here */}
      {filteredAnnouncements.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Showing {filteredAnnouncements.length} of {announcements.length} posts
          </p>
        </div>
      )}
    </div>
  );
}
