import type { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Chính sách Quyền riêng tư - VietImmerse",
  description:
    "Chính sách Quyền riêng tư của VietImmerse. Tìm hiểu cách chúng tôi thu thập, sử dụng, bảo vệ dữ liệu cá nhân và dữ liệu giọng nói của bạn.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}