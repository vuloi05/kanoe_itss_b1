import type { Metadata } from "next";
import TermsContent from "./TermsContent";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng - VietImmerse",
  description:
    "Điều khoản sử dụng nền tảng học tiếng Việt VietImmerse. Quy định về tài khoản, quyền riêng tư, dữ liệu giọng nói, sở hữu trí tuệ và quy tắc ứng xử.",
};

export default function TermsPage() {
  return <TermsContent />;
}