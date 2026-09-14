"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, GHOST_BLOG_POSTS } from "@/lib/blogs";
import { BackButton } from "@/components/ui/back-button";
import { CompassRose } from "@/components/ui/compass-rose";
import { nauticalAudio } from "@/lib/audio";
import {
  BookOpen,
  Clock,
  User,
  Tag,
  Share2,
  Check,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const post = getBlogPostBySlug(resolvedParams.slug);
  const [copied, setCopied] = useState(false);

  if (!post) {
    notFound();
  }

  const relatedPosts = GHOST_BLOG_POSTS.filter(
    (p) => p.slug !== post.slug && (p.category === post.category || p.tags.some((t) => post.tags.includes(t)))
  ).slice(0, 2);

  const handleShare = () => {
    nauticalAudio.playClick();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <BackButton />

      {/* Article Header */}
      <div className="space-y-4 border-b border-amber-900/30 pb-6">
        <div className="flex items-center gap-3 font-mono text-xs flex-wrap">
          <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 font-bold uppercase tracking-wider">
            {post.category}
          </span>
          <span className="text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> {post.readTime}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Published {post.publishedAt}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-amber-100 leading-tight">
          {post.title}
        </h1>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-serif italic border-l-2 border-amber-500/60 pl-4 py-1">
          {post.excerpt}
        </p>

        {/* Author & Share Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-amber-900/40">
            <div className="text-2xl">{post.author.avatar}</div>
            <div>
              <div className="font-serif font-bold text-sm text-amber-200">{post.author.name}</div>
              <div className="font-mono text-[11px] text-slate-400">{post.author.role}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="px-4 py-2 bg-slate-900 border border-amber-900/40 hover:border-amber-500 text-amber-300 font-mono text-xs font-bold rounded-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? "Link Copied!" : "Share Chronicle"}</span>
          </button>
        </div>
      </div>

      {/* Article Content Render */}
      <article className="prose prose-invert max-w-none space-y-6 text-slate-200 text-sm sm:text-base leading-relaxed">
        {post.content.split("\n\n").map((paragraph, idx) => {
          if (paragraph.startsWith("# ")) {
            return (
              <h1 key={idx} className="text-2xl sm:text-3xl font-serif font-bold text-amber-200 pt-4 border-b border-amber-900/30 pb-2">
                {paragraph.replace("# ", "")}
              </h1>
            );
          }
          if (paragraph.startsWith("## ")) {
            return (
              <h2 key={idx} className="text-xl sm:text-2xl font-serif font-semibold text-amber-300 pt-3">
                {paragraph.replace("## ", "")}
              </h2>
            );
          }
          if (paragraph.startsWith("---")) {
            return <hr key={idx} className="border-amber-900/30 my-6" />;
          }
          if (paragraph.startsWith("```")) {
            const cleanCode = paragraph.replace(/```[a-z]*/g, "").trim();
            return (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-amber-900/40 font-mono text-xs overflow-x-auto text-emerald-400">
                <pre>{cleanCode}</pre>
              </div>
            );
          }
          return (
            <p key={idx} className="text-slate-300">
              {paragraph}
            </p>
          );
        })}
      </article>

      {/* Tags List */}
      <div className="pt-6 border-t border-amber-900/30 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-amber-500 font-bold uppercase tracking-wider mr-2 flex items-center gap-1">
          <Tag className="w-3.5 h-3.5" /> Topic Tags:
        </span>
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded bg-slate-900 border border-amber-900/40 text-amber-300 font-mono text-xs"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Related Chronicles */}
      {relatedPosts.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-amber-900/30">
          <h3 className="text-xl font-serif font-bold text-amber-200 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> Related Ghost Chronicles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedPosts.map((rel) => (
              <Link
                key={rel.slug}
                href={`/blog/${rel.slug}`}
                className="bg-slate-900/60 border border-amber-900/30 hover:border-amber-500/60 p-4 rounded-xl backdrop-blur-md block space-y-2 group transition-all"
              >
                <div className="font-mono text-[11px] text-amber-400 font-bold">{rel.category}</div>
                <h4 className="font-serif font-semibold text-amber-100 group-hover:text-amber-300 transition-colors text-sm">
                  {rel.title}
                </h4>
                <p className="text-slate-400 text-xs line-clamp-2">{rel.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
