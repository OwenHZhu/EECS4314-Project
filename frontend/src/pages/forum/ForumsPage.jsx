import { useState } from "react";
import { getThreads } from "../../api/discussion/discussionService.js";
import ForumItem from "./components/ForumItem.jsx";
import { useEffect } from "react";


export default function ForumsPage() {
  const [threads, setThreads] = useState(null);

  useEffect(() => {
    async function fetchThreads() {
      const res = await getThreads();
      setThreads(res.data);
    }
    fetchThreads();
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <title>Forums & Discussions | BookAtlas</title>

      {/* Header section */}
      <div className="mb-10">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#444] mb-2">
          Community
        </p>
        <h1 className="text-[40px] font-semibold tracking-tight text-[#f0f0f0]">
          Forums
        </h1>
        <p className="text-[14px] text-[#444] mt-2">
          Discuss, theorize, and ask questions about your favourite books.
        </p>
      </div>

      {/* Subtitle */}
      <div className="border-b-2 border-[#1E3C36] mb-4">
        <h1 className="text-[#BFB8AD] font-semibold">Latest Posts</h1>
      </div>

      {/* Render empty message if no forums*/}
      {!threads && (
        <div className="flex flex-col text-center p-4 m-2 border-2 rounded-lg border-[#1E3C36] shadow-md">
          <p className="text-sm text-[#5A4B4B]">No posts yet!</p>
          <p className="text-sm text-[#5A4B4B]">Search for a book to be the first to say something!</p>
        </div>
      )}

      {/* Forum thread list */}
      {
        threads && (
          <div className="flex flex-col space-y-3">
            {threads.map((thread) => {

              return (
                <ForumItem
                  key={thread.id}
                  thread={thread}
                />
              );
            })}
          </div>
        )
      }

    </div>
  );
}