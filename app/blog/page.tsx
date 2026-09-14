"use client";

import { useState } from "react";
import Link from "next/link";
import { GHOST_BLOG_POSTS, BlogPost } from "@/lib/blogs";
import { BackButton } from "@/components/ui/back-button";
import { CompassRose } from "@/components/ui/compass-rose";
import {
  BookOpen,
  Search,
  Tag,
  Clock,
  User,
  ArrowRight,
  Sparkles,
  Shield,
  Filter,
} from "lucide-react";

export default function BlogIndexPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = ["ALL", "Cryptography", "Steganography", "Naval Intelligence", "Security Audits"];

  const filteredPosts = GHOST_BLOG_POSTS.filter((post) => {
    const matchesCategory = selectedCategory === "ALL" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = GHOST_BLOG_POSTS.find((p) => p.featured) || GHOST_BLOG_POSTS[0];

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <BackButton />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-900/30 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-xs sm:text-sm font-mono tracking-wider uppercase mb-1">
            <BookOpen className="w-4 h-4" /> Ghost Ship Dispatches & Chronicles
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold font-serif text-amber-100">
            Ghost Logs & Cryptographic Dispatches
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 font-mono">
            Technical deep-dives into WebCrypto AES-GCM, Ed25519 signatures, zero-width steganography, and naval intelligence.
          </p>
        </div>
        <div className="w-12 h-12 sm:w-16 sm:h-16 relative opacity-80 shrink-0 hidden sm:block">
          <CompassRose ringColor="#d97706" arrowColor="#f59e0b" />
        </div>
      </div>

      {/* Featured Post Banner */}
      {featuredPost && (
        <div className="relative rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-amber-950/40 border border-amber-500/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl group overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none text-amber-500">
            <Sparkles className="w-48 h-48" />
          </div>

          <div className="space-y-4 max-w-3xl relative z-10">
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold uppercase tracking-wider">
                Featured Chronicle
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> {featuredPost.readTime}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-amber-100 group-hover:text-amber-300 transition-colors">
              <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed">{featuredPost.excerpt}</p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-amber-900/30">
              <div className="flex items-center gap-2 font-mono text-xs text-amber-300">
                <span className="text-lg">{featuredPost.author.avatar}</span>
                <span className="font-bold">{featuredPost.author.name}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{featuredPost.publishedAt}</span>
              </div>

              <Link
                href={`/blog/${featuredPost.slug}`}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>Read Dispatch</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-amber-900/30 backdrop-blur-md">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dispatches by topic, algorithm, author, or keyword..."
            className="w-full bg-slate-950 border border-amber-900/40 rounded-lg pl-10 pr-4 py-2 text-amber-100 font-mono text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-amber-600 text-slate-950 shadow-md"
                  : "bg-slate-950 border border-amber-900/40 text-slate-400 hover:text-amber-300 hover:border-amber-500/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <article
            key={post.slug}
            className="bg-slate-900/60 border border-amber-900/30 hover:border-amber-500/50 rounded-xl p-5 backdrop-blur-md flex flex-col justify-between space-y-4 group transition-all hover:-translate-y-1 shadow-lg"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-400 font-bold uppercase tracking-wider">
                  {post.category}
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" /> {post.readTime}
                </span>
              </div>

              <h3 className="text-lg font-serif font-semibold text-amber-100 group-hover:text-amber-300 transition-colors leading-snug">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>

              <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">{post.excerpt}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-amber-900/20">
              <div className="flex flex-wrap gap-1">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 font-mono text-xs text-amber-200">
                  <span>{post.author.avatar}</span>
                  <span className="text-slate-300 font-medium text-[11px] truncate max-w-[120px]">
                    {post.author.name}
                  </span>
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="text-amber-400 hover:text-amber-300 font-mono text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <span>Read</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-amber-900/20 p-8 space-y-3">
          <BookOpen className="w-10 h-10 text-amber-500/40 mx-auto" />
          <h3 className="text-amber-200 font-serif text-lg">No Ghost Dispatches Found</h3>
          <p className="text-slate-400 text-xs font-mono">
            No chronicles match your search query or category filter. Try clearing filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
            }}
            className="px-4 py-2 bg-amber-950/60 border border-amber-500/50 text-amber-300 font-mono text-xs font-bold rounded-lg hover:bg-amber-900/80 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
