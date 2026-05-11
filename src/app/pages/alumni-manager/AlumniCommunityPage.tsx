import { useState, useEffect } from "react";
import { MessageSquare, Calendar, Target, Award, Users, Plus, Loader2 } from "lucide-react";
import { alumniManagerApi } from "../../../lib/api";

export function AlumniCommunityPage() {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await alumniManagerApi.community.getPosts().catch(() => null);
        if (res?.data && res.data.length > 0) {
          setPosts(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Community Chat & Events</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage announcements, discussions, and alumni success stories.</p>
        </div>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getPostColor(post.type)}`}>
                  {getPostIcon(post.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{post.title}</h3>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                        {post.author} • <span className="text-teal-600">{post.role}</span> • {post.date}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-600 mt-4 leading-relaxed">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-50">
                    <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-teal-600 transition-colors">
                      <Target className="w-4 h-4" /> {post.likes} Likes
                    </button>
                    <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-teal-600 transition-colors">
                      <MessageSquare className="w-4 h-4" /> {post.comments} Comments
                    </button>
                  </div>
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
                <span className="text-sm font-black text-slate-900">420</span>
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
    </div>
  );
}
