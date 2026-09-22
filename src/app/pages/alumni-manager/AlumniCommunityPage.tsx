import { useState, useEffect } from "react";
import { MessageSquare, Calendar, Target, Award, Users, Plus, Loader2, X, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { alumniManagerApi } from "../../../lib/api";

export function AlumniCommunityPage() {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeMembers, setActiveMembers] = useState(0);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    banner: "",
    title: "",
    description: "",
    place: "",
    date: "",
  });
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        setLoading(true);
        const [postsRes, activeCountsRes]: [any, any] = await Promise.all([
          alumniManagerApi.community.getPosts().catch(() => null),
          alumniManagerApi.community.getActiveCounts().catch(() => null),
        ]);

        if (postsRes?.data && postsRes.data.length > 0) {
          setPosts(postsRes.data);
        }

        const activeCounts = activeCountsRes?.data;
        const activeCount = typeof activeCounts === "number"
          ? activeCounts
          : activeCounts?.activeCount ?? activeCounts?.activeUsers ?? activeCounts?.count;
        if (typeof activeCount === "number") {
          setActiveMembers(activeCount);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunityData();
  }, []);

  const resetAnnouncementForm = () => {
    setAnnouncementForm({ banner: "", title: "", description: "", place: "", date: "" });
    setEditingPostId(null);
  };

  const formatDateTimeLocal = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const openEditAnnouncement = (post: any) => {
    setEditingPostId(post._id || post.id);
    setAnnouncementForm({
      banner: post.banner || "",
      title: post.title || "",
      description: post.description || post.content || "",
      place: post.place || "",
      date: formatDateTimeLocal(post.date),
    });
    setIsPostDialogOpen(true);
  };

  const handleCreateAnnouncement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = announcementForm.title.trim();
    const description = announcementForm.description.trim();
    if (!title || !description) return;

    try {
      setIsSubmittingPost(true);
      const wasEditing = Boolean(editingPostId);
      const announcement: Record<string, string> = { title, description };
      if (announcementForm.banner.trim()) announcement.banner = announcementForm.banner.trim();
      if (announcementForm.place.trim()) announcement.place = announcementForm.place.trim();
      if (announcementForm.date) announcement.date = new Date(announcementForm.date).toISOString();

      if (editingPostId) {
        await alumniManagerApi.community.updateAnnouncement(editingPostId, announcement);
      } else {
        await alumniManagerApi.community.createAnnouncement(announcement);
      }
      const postsRes: any = await alumniManagerApi.community.getPosts();
      if (Array.isArray(postsRes?.data)) {
        setPosts(postsRes.data);
      }
      resetAnnouncementForm();
      setIsPostDialogOpen(false);
      toast.success(wasEditing ? "Announcement updated successfully" : "Announcement posted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to post announcement");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const getPostIcon = (type: string) => {
    switch(type) {
      case 'announcement': return <MessageSquare className="w-5 h-5" />;
      case 'event': return <Calendar className="w-5 h-5" />;
      case 'success_story': return <Award className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getPostColor = (type: string) => {
    switch(type) {
      case 'announcement': return "bg-teal-100 text-teal-600";
      case 'event': return "bg-blue-100 text-blue-600";
      case 'success_story': return "bg-amber-100 text-amber-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const getAuthorName = (author: any) => {
    if (typeof author === "string") return author;
    return author?.name || author?.gxId || "Community Manager";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Community & Events</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage announcements, discussions, and alumni success stories.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetAnnouncementForm();
            setIsPostDialogOpen(true);
          }}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {posts.map((post) => (
            <div key={post._id || post.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getPostColor(post.type)}`}>
                  {getPostIcon(post.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{post.title || "Community Announcement"}</h3>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                        {getAuthorName(post.author)} • <span className="text-teal-600">{post.role || post.author?.role || "Alumni Manager"}</span> • {post.date || post.createdAt}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openEditAnnouncement(post)}
                      className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-teal-50 hover:text-teal-600"
                      title="Edit announcement"
                      aria-label="Edit announcement"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-slate-600 mt-4 leading-relaxed">
                    {post.description || post.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-4">Community Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center"><Users className="w-4 h-4" /></div>
                  <span className="text-sm font-bold text-slate-700">Active Members</span>
                </div>
                <span className="text-sm font-black text-slate-900">{activeMembers}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Calendar className="w-4 h-4" /></div>
                  <span className="text-sm font-bold text-slate-700">Events this month</span>
                </div>
                <span className="text-sm font-black text-slate-900">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPostDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">{editingPostId ? "Edit Announcement" : "New Announcement"}</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">Share an update with the alumni community.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetAnnouncementForm();
                  setIsPostDialogOpen(false);
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close announcement dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="mt-6 space-y-4">
              <div>
                <label htmlFor="announcement-title" className="block text-sm font-bold text-slate-700">Title</label>
                <input
                  id="announcement-title"
                  value={announcementForm.title}
                  onChange={(event) => setAnnouncementForm({ ...announcementForm, title: event.target.value })}
                  placeholder="Alumni Mentorship Session"
                  required
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm font-medium text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                />
              </div>
              <div>
                <label htmlFor="announcement-description" className="block text-sm font-bold text-slate-700">Description</label>
                <textarea
                  id="announcement-description"
                  value={announcementForm.description}
                  onChange={(event) => setAnnouncementForm({ ...announcementForm, description: event.target.value })}
                  placeholder="Applications for the next alumni mentorship session are now open."
                  rows={4}
                  required
                  className="mt-1 w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm font-medium text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                />
              </div>
              <div>
                <label htmlFor="announcement-banner" className="block text-sm font-bold text-slate-700">Banner URL <span className="font-medium text-slate-400">(optional)</span></label>
                <input
                  id="announcement-banner"
                  type="url"
                  value={announcementForm.banner}
                  onChange={(event) => setAnnouncementForm({ ...announcementForm, banner: event.target.value })}
                  placeholder="https://example.com/images/banner.jpg"
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm font-medium text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="announcement-place" className="block text-sm font-bold text-slate-700">Place <span className="font-medium text-slate-400">(optional)</span></label>
                  <input
                    id="announcement-place"
                    value={announcementForm.place}
                    onChange={(event) => setAnnouncementForm({ ...announcementForm, place: event.target.value })}
                    placeholder="Online"
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm font-medium text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>
                <div>
                  <label htmlFor="announcement-date" className="block text-sm font-bold text-slate-700">Date <span className="font-medium text-slate-400">(optional)</span></label>
                  <input
                    id="announcement-date"
                    type="datetime-local"
                    value={announcementForm.date}
                    onChange={(event) => setAnnouncementForm({ ...announcementForm, date: event.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm font-medium text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetAnnouncementForm();
                    setIsPostDialogOpen(false);
                  }}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPost || !announcementForm.title.trim() || !announcementForm.description.trim()}
                  className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSubmittingPost ? "Saving..." : editingPostId ? "Save Changes" : "Post Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
