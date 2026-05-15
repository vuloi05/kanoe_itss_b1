"use client";

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";
import { userApi } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface AvatarUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (avatarUrl: string) => void;
  currentAvatarUrl?: string | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function AvatarUploadModal({
  open,
  onClose,
  onSuccess,
  currentAvatarUrl,
}: AvatarUploadModalProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image state — only set when user picks a new file
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isPickingNew, setIsPickingNew] = useState(false);

  // Derive effective source: user-picked file takes priority, then current avatar
  // isPickingNew forces file picker to show even when currentAvatarUrl exists
  const effectiveImageSrc = isPickingNew
    ? imageSrc
    : imageSrc ?? (open ? currentAvatarUrl ?? null : null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      showToast("error", t("Chỉ hỗ trợ JPG, PNG, WebP.", "JPG、PNG、WebPのみ対応。"));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast("error", t("Ảnh phải nhỏ hơn 5MB.", "画像は5MB以下にしてください。"));
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string);
      setIsPickingNew(false);
    });
    reader.readAsDataURL(file);
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async () => {
    if (!effectiveImageSrc || !croppedAreaPixels) return;

    setIsUploading(true);
    try {
      const blob = await getCroppedImg(effectiveImageSrc, croppedAreaPixels, rotation);
      const result = await userApi.uploadAvatar(blob);
      onSuccess(result.avatarUrl);
      showToast("success", t("Cập nhật ảnh đại diện thành công!", "アバターを更新しました！"));
      // Brief delay so user sees the toast before modal closes
      setTimeout(() => handleClose(), 1200);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("Đã xảy ra lỗi.", "エラーが発生しました。");
      showToast("error", message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setImageSrc(null);
    setIsPickingNew(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setToast(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-[#112340] dark:text-white">
            {t("Cập nhật ảnh đại diện", "アバターを更新")}
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-400">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {!effectiveImageSrc ? (
            /* File Picker */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#112340] dark:hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-[#112340]/10 dark:bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[32px] text-[#112340] dark:text-blue-400">
                  add_a_photo
                </span>
              </div>
              <p className="text-sm font-medium text-[#112340] dark:text-white mb-1">
                {t("Chọn ảnh từ máy tính", "コンピュータから画像を選択")}
              </p>
              <p className="text-xs text-slate-400">
                JPG, PNG, WebP • {t("Tối đa 5MB", "最大5MB")}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            /* Cropper + Controls */
            <div className="space-y-5">
              {/* Crop Area */}
              <div className="relative w-full h-[300px] bg-slate-900 rounded-2xl overflow-hidden">
                <Cropper
                  image={effectiveImageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  cropShape="rect"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                />
              </div>

              {/* Zoom Slider */}
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  zoom_out
                </span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-[#112340] dark:accent-blue-500"
                />
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  zoom_in
                </span>
              </div>

              {/* Rotate Slider */}
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  rotate_left
                </span>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-[#112340] dark:accent-blue-500"
                />
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  rotate_right
                </span>
                <span className="text-xs text-slate-400 w-10 text-right">{rotation}°</span>
              </div>

              {/* Change image link */}
              <button
                onClick={() => {
                  setImageSrc(null);
                  setIsPickingNew(true);
                  setCrop({ x: 0, y: 0 });
                  setZoom(1);
                  setRotation(0);
                  // Reset file input so the same file can be re-selected
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs text-[#112340] dark:text-blue-400 hover:underline font-medium"
              >
                {t("Chọn ảnh khác", "別の画像を選択")}
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {t("Hủy", "キャンセル")}
          </button>
          <button
            onClick={handleSave}
            disabled={!effectiveImageSrc || isUploading}
            className="px-5 py-2.5 text-sm font-bold text-white bg-[#112340] hover:bg-[#1E3A8A] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-[#112340]/20"
          >
            {isUploading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isUploading
              ? t("Đang tải lên...", "アップロード中...")
              : t("Lưu thay đổi", "変更を保存")}
          </button>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-300 ${
              toast.type === "success"
                ? "bg-emerald-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {toast.type === "success" ? "check_circle" : "error"}
            </span>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
