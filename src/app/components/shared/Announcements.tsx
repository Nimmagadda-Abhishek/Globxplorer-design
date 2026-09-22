import { BellRing, CalendarDays, Loader2, Megaphone, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

export interface Announcement {
  _id?: string;
  title?: string;
  description?: string;
  content?: string;
  type?: string;
  createdAt?: string;
  author?: {
    name?: string;
    gxId?: string;
  } | string;
  banner?: string;
  place?: string;
  date?: string;
}

type AnnouncementFetcher = () => Promise<any>;

const getAnnouncements = (response: any): Announcement[] => {
  const data = response?.data || response || [];
  return Array.isArray(data) ? data : [];
};

const getTitle = (announcement: Announcement) => announcement.title || "Community Announcement";
const getDescription = (announcement: Announcement) => announcement.description || announcement.content || "";
const getAuthor = (author: Announcement["author"]) => {
  if (typeof author === "string") return author;
  return author?.name || author?.gxId || "Alumni Manager";
};
const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

export function AnnouncementPreview({
  announcements,
  path,
  accent = "indigo",
}: {
  announcements: Announcement[];
  path: string;
  accent?: "indigo" | "violet";
}) {
  const accentClasses = accent === "violet"
    ? "text-violet-600 hover:text-violet-700"
    : "text-indigo-600 hover:text-indigo-700";

  return (
    <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Announcements</h3>
            <p className="text-xs font-medium text-slate-400 mt-1">Latest updates from the GlobXplore team</p>
          </div>
        </div>
        <Link to={path} className={`flex items-center gap-1 text-sm font-bold ${accentClasses}`}>
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {announcements.length > 0 ? (
        <div className="space-y-3">
          {announcements.slice(0, 3).map((announcement, index) => (
            <Link
              key={announcement._id || index}
              to={path}
              className="block rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-amber-200 hover:bg-amber-50/40"
            >
              <div className="flex items-start gap-3">
                <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-black text-slate-900">{getTitle(announcement)}</h4>
                  <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-500">{getDescription(announcement)}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {getAuthor(announcement.author)}{announcement.createdAt ? ` • ${formatDate(announcement.createdAt)}` : ""}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-sm font-medium text-slate-400">No announcements yet.</p>
      )}
    </section>
  );
}

export function AnnouncementsPage({
  fetchAnnouncements,
  role,
}: {
  fetchAnnouncements: AnnouncementFetcher;
  role: "student" | "alumni";
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const response = await fetchAnnouncements();
        setAnnouncements(getAnnouncements(response));
      } catch (loadError) {
        console.error("Announcements fetch error:", loadError);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadAnnouncements();
  }, [fetchAnnouncements]);

  const isStudent = role === "student";
  const accentColor = isStudent ? "indigo" : "violet";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Announcements</h1>
        <p className="mt-1 font-medium text-slate-500">Stay up to date with the latest GlobXplore news and opportunities.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className={`h-8 w-8 animate-spin ${isStudent ? "text-indigo-600" : "text-violet-600"}`} />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-100 bg-rose-50 p-8 text-center text-sm font-bold text-rose-600">
          Unable to load announcements right now.
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm">
          <BellRing className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-sm font-bold text-slate-400">No announcements available.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {announcements.map((announcement, index) => (
            <article key={announcement._id || index} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              {announcement.banner && (
                <img src={announcement.banner} alt="" className="h-48 w-full object-cover" />
              )}
              <div className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isStudent ? "bg-indigo-50 text-indigo-600" : "bg-violet-50 text-violet-600"}`}>
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-black text-slate-900">{getTitle(announcement)}</h2>
                    <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                      {getAuthor(announcement.author)}{announcement.createdAt ? ` • ${formatDate(announcement.createdAt)}` : ""}
                    </p>
                  </div>
                </div>
                <p className="mt-6 whitespace-pre-wrap text-base font-medium leading-relaxed text-slate-600">{getDescription(announcement)}</p>
                {(announcement.place || announcement.date) && (
                  <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-4 text-xs font-bold text-slate-500">
                    {announcement.place && <span>{announcement.place}</span>}
                    {announcement.date && (
                      <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{formatDate(announcement.date)}</span>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
