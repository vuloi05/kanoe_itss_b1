import type { Metadata } from "next";
import BlogContent from "./BlogContent";

export const metadata: Metadata = {
  title: "Blog & Văn hóa - VietImmerse",
  description:
    "Khám phá bí quyết học tiếng Việt miền Bắc, phương pháp AI, và nhịp sống văn hóa Hà Nội cùng VietImmerse.",
};

export default function BlogPage() {
  return <BlogContent />;
}