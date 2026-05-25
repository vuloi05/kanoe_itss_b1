"use client";

import { type BookingDto } from "@/lib/api";
import { getUserTimezone } from "@/lib/chatUtils";
import DatePicker from "@/components/common/DatePicker";
import TimePicker from "@/components/common/TimePicker";
import SelectPicker from "@/components/common/SelectPicker";

export interface SchedulePanelProps {
  showSchedulePanel: boolean;
  setShowSchedulePanel: (show: boolean) => void;
  t: (vi: string, ja: string) => string;
  bookingDate: string;
  setBookingDate: (val: string) => void;
  dateError: string;
  setDateError: (val: string) => void;
  bookingHour: string;
  setBookingHour: (val: string) => void;
  bookingMinute: string;
  setBookingMinute: (val: string) => void;
  bookingDuration: string;
  setBookingDuration: (val: string) => void;
  bookingTitle: string;
  setBookingTitle: (val: string) => void;
  bookingMeetingLink: string;
  meetingLinkError: string;
  setMeetingLinkError: (val: string) => void;
  setBookingMeetingLink: (val: string) => void;
  isSubmitting: boolean;
  handleBookingSubmit: () => void;
  bookingCards: (BookingDto & { removing?: boolean })[];
  formatDateDisplay: (dateStr: string) => string;
  formatBookingDate: (dateStr: string) => string;
  formatBookingTime: (dateStr: string) => string;
  calcEndTime: (hour: string, min: string, dur: string) => string;
  cancelModalId: string | null;
  setCancelModalId: (id: string | null) => void;
  detailModalId: string | null;
  setDetailModalId: (id: string | null) => void;
  cancellingId: string | null;
  confirmCancel: (bookingId: string) => void;
}

export default function SchedulePanel({
  showSchedulePanel,
  setShowSchedulePanel,
  t,
  bookingDate,
  setBookingDate,
  dateError,
  setDateError,
  bookingHour,
  setBookingHour,
  bookingMinute,
  setBookingMinute,
  bookingDuration,
  setBookingDuration,
  bookingTitle,
  setBookingTitle,
  bookingMeetingLink,
  meetingLinkError,
  setMeetingLinkError,
  setBookingMeetingLink,
  isSubmitting,
  handleBookingSubmit,
  bookingCards,
  formatDateDisplay,
  formatBookingDate,
  formatBookingTime,
  calcEndTime,
  cancelModalId,
  setCancelModalId,
  detailModalId,
  setDetailModalId,
  cancellingId,
  confirmCancel,
}: SchedulePanelProps) {
  const durationOptions = [
    { value: "30",  label: t("30 phút", "30分") },
    { value: "45",  label: t("45 phút", "45分") },
    { value: "60",  label: t("60 phút", "60分") },
    { value: "75",  label: t("75 phút", "75分") },
    { value: "90",  label: t("90 phút", "90分") },
    { value: "105", label: t("105 phút", "105分") },
    { value: "120", label: t("120 phút", "120分") },
  ];

  // §7: Dual timezone display
  const userTz = getUserTimezone();
  const hanoiOffset = 7 * 60; // UTC+7 in minutes
  const userOffsetMin = -new Date().getTimezoneOffset(); // user's local offset in minutes
  const isDifferentTz = userOffsetMin !== hanoiOffset;

  // Convert a HH:MM string from Hanoi (UTC+7) to user's local timezone
  const toLocalTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const totalMin = h * 60 + m + (userOffsetMin - hanoiOffset);
    const adjusted = ((totalMin % 1440) + 1440) % 1440;
    return `${String(Math.floor(adjusted / 60)).padStart(2, "0")}:${String(adjusted % 60).padStart(2, "0")}`;
  };
  return (
    <>
      {/* Scheduling Panel Overlay Backdrop */}
      {showSchedulePanel && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={() => setShowSchedulePanel(false)}
        />
      )}

      {/* Right Column: Scheduling Panel (Slide-in/out) */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 bg-[#f9f9f7] p-6 overflow-y-auto border-l border-outline-variant/10 z-50 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
          showSchedulePanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setShowSchedulePanel(false)}
          className="absolute top-4 right-4 p-1 text-secondary hover:text-primary transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h4 className="font-bold text-primary mb-2 flex items-center gap-2 font-headline">
          <span className="material-symbols-outlined text-xl">
            event_available
          </span>
          {t(
            "Đặt thời gian học",
            "授業時間をセットする"
          )}
        </h4>
        <p className="text-[10px] text-secondary mb-6 font-medium leading-tight">
          {t(
            "Chọn thời gian rảnh của bạn để học cùng Sakura-san.",
            "空き時間を選択してサクラさんと学習しましょう。"
          )}
          <br />
          {t(
            "空き時間を選択してサクラさんと学習しましょう。",
            "Chọn thời gian rảnh của bạn để học cùng Sakura-san."
          )}
        </p>

        <div className="space-y-6">
          <div className="space-y-4">
            {/* Date Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-outline-variant uppercase tracking-wider">
                {t("Ngày học", "日付")}
              </label>
              <DatePicker
                value={bookingDate}
                onChange={(val) => { setBookingDate(val); setDateError(""); }}
                hasError={!!dateError}
                placeholder={t("Chọn ngày", "日付を選択")}
                minDate={new Date().toISOString().split("T")[0]}
              />
              {dateError && <p className="text-red-500 text-[11px] font-medium mt-1">{dateError}</p>}
            </div>

            {/* Start Time */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-outline-variant uppercase tracking-wider">
                {t("Bắt đầu", "開始時間")}
              </label>
              <TimePicker
                hour={bookingHour}
                minute={bookingMinute}
                onHourChange={setBookingHour}
                onMinuteChange={setBookingMinute}
              />
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-outline-variant uppercase tracking-wider">
                {t("Thời lượng", "期間")}
              </label>
              <SelectPicker
                value={bookingDuration}
                onChange={setBookingDuration}
                options={durationOptions}
              />
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-outline-variant uppercase tracking-wider">
                {t("Tiêu đề", "タイトル")}
              </label>
              <input
                type="text"
                value={bookingTitle}
                onChange={(e) => setBookingTitle(e.target.value)}
                placeholder={t("VD: Luyện giao tiếp N3", "例: N3会話練習")}
                className="w-full bg-[#f0f0ee] rounded-xl px-4 py-3 text-sm text-on-surface outline-none transition-all focus:ring-2 focus:ring-primary/30 placeholder:text-outline/40"
              />
            </div>

            {/* Meeting Link */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-outline-variant uppercase tracking-wider">
                {t("Link Meeting", "ミーティングリンク")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline/40 text-lg pointer-events-none">
                  videocam
                </span>
                <input
                  type="url"
                  value={bookingMeetingLink}
                  onChange={(e) => { setBookingMeetingLink(e.target.value); setMeetingLinkError(""); }}
                  placeholder={t("VD: https://meet.google.com/...", "例: https://meet.google.com/...")}
                  className={`w-full bg-[#f0f0ee] rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface outline-none transition-all focus:ring-2 placeholder:text-outline/40 ${meetingLinkError ? "ring-2 ring-red-400 focus:ring-red-400" : "focus:ring-primary/30"}`}
                />
              </div>
              {meetingLinkError && <p className="text-red-500 text-[11px] font-medium mt-1">{meetingLinkError}</p>}
            </div>

            {/* Summary */}
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-[10px] text-primary font-bold mb-1">
                {bookingTitle || t("TỔNG KẾT", "まとめ")}
              </p>
              <p className="text-xs text-secondary leading-relaxed">
                {bookingDate ? formatDateDisplay(bookingDate) : t("Chưa chọn ngày", "日付未選択")}
                <br />
                {`${bookingHour.split(":")[0]}:${bookingMinute}`} - {calcEndTime(bookingHour, bookingMinute, bookingDuration)} ({bookingDuration}m) (GMT+7)
                {isDifferentTz && (
                  <>
                    <br />
                    <span className="text-primary/70">
                      {toLocalTime(`${bookingHour.split(":")[0]}:${bookingMinute}`)} - {toLocalTime(calcEndTime(bookingHour, bookingMinute, bookingDuration))} ({userTz.name})
                    </span>
                  </>
                )}
              </p>
              {bookingMeetingLink && (
                <a
                  href={bookingMeetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-primary font-semibold hover:underline"
                >
                  <span className="material-symbols-outlined text-sm">videocam</span>
                  {t("Tham gia Meeting", "ミーティングに参加")}
                </a>
              )}
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleBookingSubmit}
              disabled={isSubmitting}
              className={`w-full py-3 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all text-sm cursor-pointer ${
                isSubmitting ? "bg-gray-400 cursor-not-allowed" : "lotus-gradient hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {isSubmitting ? t("Đang gửi...", "送信中...") : t("Xác nhận", "セットする")}
            </button>
          </div>

          {/* History Section */}
          <div className="pt-6 border-t border-outline-variant/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-outline-variant uppercase">
                {t("Lịch sử", "最近の履歴")}
              </span>
              <span className="material-symbols-outlined text-sm text-outline-variant">
                history
              </span>
            </div>
            <div className="space-y-3">
              {bookingCards.filter(c => c.status !== "cancelled").map(card => {
                const now = new Date();
                const start = new Date(card.startTime);
                const end = new Date(card.endTime);
                
                let stateLabel = "";
                let stateColor = "";
                let stateIcon = "";

                if (end < now) {
                  stateLabel = t("Hoàn thành", "完了");
                  stateColor = "bg-emerald-100 text-emerald-700";
                  stateIcon = "check_circle";
                } else if (start > now) {
                  stateLabel = t("Sắp tới", "予定");
                  stateColor = "bg-blue-100 text-blue-700";
                  stateIcon = "event_note";
                } else {
                  stateLabel = t("Đang diễn ra", "進行中");
                  stateColor = "bg-amber-100 text-amber-700";
                  stateIcon = "play_circle";
                }

                // Short date like "25 Oct"
                const dateStr = start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

                return (
                  <div key={card.bookingId} className="p-3 bg-white border border-outline-variant/10 rounded-xl flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stateColor}`}>
                      <span className="material-symbols-outlined text-base">
                        {stateIcon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-primary">
                        {stateLabel}
                      </p>
                      <p className="text-[10px] text-secondary">{dateStr} • {card.durationMinutes}m</p>
                    </div>
                  </div>
                );
              })}
              {bookingCards.filter(c => c.status !== "cancelled").length === 0 && (
                <p className="text-xs text-secondary text-center italic mt-2">
                  {t("Chưa có lịch sử", "履歴なし")}
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Cancel Confirmation Modal */}
      {cancelModalId && (() => {
        const card = bookingCards.find(c => c.bookingId === cancelModalId);
        if (!card) return null;
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => !cancellingId && setCancelModalId(null)} />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-600">event_busy</span>
                </div>
                <h3 className="font-bold text-primary font-headline">
                  {t("Xác nhận hủy", "キャンセル確認")}
                </h3>
              </div>
              <p className="text-sm text-secondary mb-2">
                {t("Bạn có chắc muốn hủy buổi học này không?", "このレッスンをキャンセルしますか？")}
              </p>
              <div className="p-3 bg-surface-container rounded-xl mb-5 text-xs text-on-surface-variant space-y-1">
                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">calendar_today</span>{formatBookingDate(card.startTime)}</div>
                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">schedule</span>{formatBookingTime(card.startTime)} - {formatBookingTime(card.endTime)} ({card.durationMinutes}m)</div>
              </div>
              <div className="flex gap-3">
                <button disabled={!!cancellingId} onClick={() => setCancelModalId(null)} className="flex-1 py-2.5 text-sm font-bold text-secondary border border-outline-variant/30 rounded-xl hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50">
                  {t("Không", "いいえ")}
                </button>
                <button disabled={!!cancellingId} onClick={() => confirmCancel(card.bookingId)} className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                  {cancellingId === card.bookingId && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {t("Xác nhận hủy", "はい")}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Detail Modal */}
      {detailModalId && (() => {
        const card = bookingCards.find(c => c.bookingId === detailModalId);
        if (!card) return null;
        const statusMap: Record<string, { label: string; color: string }> = {
          pending: { label: t("Chờ xác nhận", "確認待ち"), color: "bg-amber-100 text-amber-700" },
          confirmed: { label: t("Đã xác nhận", "確認済み"), color: "bg-emerald-100 text-emerald-700" },
          cancelled: { label: t("Đã hủy", "キャンセル済み"), color: "bg-red-100 text-red-700" },
        };
        const st = statusMap[card.status] || statusMap.pending;
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDetailModalId(null)} />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl z-10">
              <button onClick={() => setDetailModalId(null)} className="absolute top-4 right-4 p-1 text-secondary hover:text-primary cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined">auto_stories</span>
                </div>
                <div>
                  <h3 className="font-bold text-primary font-headline text-base">{t("Chi tiết buổi học", "レッスン詳細")}</h3>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${st.color}`}>{st.label}</span>
                </div>
              </div>
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl">
                  <span className="material-symbols-outlined text-primary text-lg">person</span>
                  <div><p className="text-[10px] text-outline-variant font-bold uppercase">{t("Học viên", "学習者")}</p><p className="text-sm font-semibold text-primary">{card.learnerName}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl">
                  <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
                  <div><p className="text-[10px] text-outline-variant font-bold uppercase">{t("Ngày học", "日付")}</p><p className="text-sm font-semibold text-primary">{formatBookingDate(card.startTime)}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl">
                  <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                  <div><p className="text-[10px] text-outline-variant font-bold uppercase">{t("Thời gian", "時間")}</p><p className="text-sm font-semibold text-primary">{formatBookingTime(card.startTime)} - {formatBookingTime(card.endTime)} ({card.durationMinutes}m)</p></div>
                </div>
                {card.notes && (
                  <div className="flex items-start gap-3 p-3 bg-surface-container rounded-xl">
                    <span className="material-symbols-outlined text-primary text-lg mt-0.5">description</span>
                    <div><p className="text-[10px] text-outline-variant font-bold uppercase">{t("Ghi chú", "メモ")}</p><p className="text-sm text-secondary">{card.notes}</p></div>
                  </div>
                )}
                <div className="flex items-start gap-3 p-3 bg-surface-container rounded-xl">
                  <span className="material-symbols-outlined text-primary text-lg mt-0.5">videocam</span>
                  <div>
                    <p className="text-[10px] text-outline-variant font-bold uppercase">{t("Link Meeting", "ミーティングリンク")}</p>
                    {card.meetingUrl ? (
                      <a
                        href={card.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary font-semibold hover:underline break-all"
                      >
                        {card.meetingUrl}
                      </a>
                    ) : (
                      <p className="text-sm text-outline italic">{t("Chưa có link", "リンクなし")}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                {card.status === "pending" && (
                  <button onClick={() => { setDetailModalId(null); setCancelModalId(card.bookingId); }} className="flex-1 py-2.5 text-sm font-bold text-error border border-error/20 rounded-xl hover:bg-error/5 transition-colors cursor-pointer">
                    {t("Hủy buổi học", "キャンセル")}
                  </button>
                )}
                <button onClick={() => setDetailModalId(null)} className="flex-1 py-2.5 text-sm font-bold text-primary bg-surface-container-highest rounded-xl hover:bg-surface-container transition-colors cursor-pointer">
                  {t("Đóng", "閉じる")}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
