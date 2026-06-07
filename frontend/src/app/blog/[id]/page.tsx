import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MOCK_POSTS, getPostById } from "../_data";
import BlogDetailContent from "./BlogDetailContent";

// ─── Static generation for all known post slugs ───────────────
export function generateStaticParams() {
  return MOCK_POSTS.map((post) => ({ id: post.id }));
}

// ─── Dynamic metadata per post ────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = getPostById(id);

  if (!post) {
    return { title: "Bài viết không tồn tại - VietImmerse" };
  }

  return {
    title: `${post.title} - VietImmerse Blog`,
    description: post.excerpt,
  };
}

// ─── Page ─────────────────────────────────────────────────────
export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = getPostById(id);

  if (!post) notFound();

  return <BlogDetailContent post={post} />;
}
