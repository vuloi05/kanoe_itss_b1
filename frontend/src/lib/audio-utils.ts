/**
 * Pure TypeScript WAV encoder.
 * Converts raw MediaRecorder chunks → PCM 16kHz Mono WAV Blob
 * using the browser's AudioContext for decoding and resampling.
 *
 * ─── LÝ DO KỸ THUẬT (Technical Rationale) ─────────────────────────────────────
 *
 * 1. TẠI SAO PHẢI CHUYỂN ĐỔI SANG WAV?
 *    MediaRecorder mặc định xuất ra định dạng webm/opus (tuỳ trình duyệt).
 *    FPT.AI ASR API yêu cầu đầu vào là file WAV (PCM, uncompressed) để đạt
 *    độ chính xác nhận diện cao nhất. Gửi webm/opus trực tiếp sẽ gây lỗi
 *    hoặc giảm chất lượng phiên âm đáng kể.
 *
 * 2. TẠI SAO ÉP TẦN SỐ LẤY MẪU XUỐNG 16000Hz?
 *    - Mic trình duyệt thường ghi ở 44100Hz hoặc 48000Hz → file rất nặng.
 *    - Giọng nói con người nằm trong dải 300Hz–3400Hz, tần số Nyquist chỉ cần
 *      ≥ 8000Hz là đủ. 16kHz là chuẩn công nghiệp cho Speech Recognition
 *      (telephone-band = 8kHz, wideband = 16kHz).
 *    - FPT ASR được huấn luyện trên dữ liệu 16kHz → input 16kHz cho kết quả
 *      tốt nhất, đồng thời giảm ~6x kích thước file so với 48kHz.
 *
 * 3. TẠI SAO CHỈ 1 CHANNEL (MONO)?
 *    - Speech Recognition chỉ cần 1 kênh âm thanh. Stereo không mang thêm
 *      thông tin hữu ích cho ASR mà chỉ tăng gấp đôi kích thước file.
 *    - FPT ASR API chỉ xử lý Mono; gửi Stereo sẽ bị reject hoặc decode sai.
 *
 * 4. TẠI SAO DÙNG AudioContext / OfflineAudioContext?
 *    - AudioContext.decodeAudioData() là API duy nhất trên browser có thể giải
 *      mã webm/opus → raw PCM mà không cần thư viện bên ngoài (ffmpeg.wasm, v.v.).
 *    - OfflineAudioContext cho phép render offline với sampleRate tuỳ chỉnh,
 *      trình duyệt sẽ tự động resample bằng thuật toán nội bộ chất lượng cao
 *      (sinc interpolation), tốt hơn nhiều so với linear interpolation thủ công.
 * ───────────────────────────────────────────────────────────────────────────────
 */

// Chuẩn tần số lấy mẫu cho Speech Recognition (wideband standard)
const TARGET_SAMPLE_RATE = 16000;
// Mono — ASR chỉ cần 1 kênh, stereo không cải thiện chất lượng nhận diện
const NUM_CHANNELS = 1;
const BITS_PER_SAMPLE = 16;

/**
 * Decode audio chunks collected from MediaRecorder, downsample to 16 kHz Mono,
 * and encode as a standard WAV (RIFF) Blob.
 *
 * @param audioChunks - BlobParts collected via `MediaRecorder.ondataavailable`
 * @returns WAV Blob with MIME type `audio/wav`
 */
export async function exportToWav(audioChunks: BlobPart[]): Promise<Blob> {
  const rawBlob = new Blob(audioChunks);
  const arrayBuffer = await rawBlob.arrayBuffer();

  // Dùng AudioContext để giải mã webm/opus → AudioBuffer (raw PCM).
  // Đây là cách duy nhất trên browser để decode các codec phức tạp
  // mà không cần bundle thêm thư viện nặng như ffmpeg.wasm (~25MB).
  const tempCtx = new AudioContext();
  const decoded = await tempCtx.decodeAudioData(arrayBuffer);
  await tempCtx.close();

  const monoSamples = await resampleToMono(decoded, TARGET_SAMPLE_RATE);
  return encodeWav(monoSamples, TARGET_SAMPLE_RATE);
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Mix all channels down to mono and resample to `targetRate` using
 * an OfflineAudioContext (leverages the browser's built-in high-quality resampler).
 *
 * Dùng OfflineAudioContext thay vì resample thủ công vì:
 * - Trình duyệt dùng thuật toán sinc interpolation (chất lượng cao),
 *   trong khi code thủ công thường chỉ dùng linear interpolation (méo tiếng).
 * - Tự động mix multi-channel → mono khi chỉ định NUM_CHANNELS = 1.
 */
function resampleToMono(
  audioBuffer: AudioBuffer,
  targetRate: number,
): Promise<Float32Array> {
  const duration = audioBuffer.duration;
  const targetLength = Math.ceil(duration * targetRate);

  if (targetLength === 0) {
    return Promise.resolve(new Float32Array(0));
  }

  // OfflineAudioContext render offline với sampleRate = targetRate,
  // trình duyệt tự động resample từ sampleRate gốc (44.1k/48k) xuống 16kHz.
  const offlineCtx = new OfflineAudioContext(
    NUM_CHANNELS,
    targetLength,
    targetRate,
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);

  return offlineCtx.startRendering().then((rendered) => rendered.getChannelData(0));
}

/**
 * Encode raw Float32 PCM samples into a complete WAV file (RIFF / WAVE format).
 * Layout: RIFF header (12 bytes) + fmt chunk (24 bytes) + data chunk (8 + dataLen bytes)
 *
 * Tự encode WAV header thay vì dùng thư viện vì:
 * - WAV header chỉ có 44 bytes cố định, không cần dependency.
 * - Kiểm soát hoàn toàn format output (PCM, 16-bit, little-endian).
 */
function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const byteRate = sampleRate * NUM_CHANNELS * (BITS_PER_SAMPLE / 8);
  const blockAlign = NUM_CHANNELS * (BITS_PER_SAMPLE / 8);
  const dataLength = samples.length * (BITS_PER_SAMPLE / 8);

  // 44 bytes = standard WAV header size
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  let offset = 0;

  // ── RIFF Header ──
  writeString(view, offset, "RIFF");
  offset += 4;
  view.setUint32(offset, 36 + dataLength, true); // ChunkSize
  offset += 4;
  writeString(view, offset, "WAVE");
  offset += 4;

  // ── fmt Sub-chunk ──
  writeString(view, offset, "fmt ");
  offset += 4;
  view.setUint32(offset, 16, true); // Subchunk1Size (PCM = 16)
  offset += 4;
  view.setUint16(offset, 1, true); // AudioFormat (PCM = 1)
  offset += 2;
  view.setUint16(offset, NUM_CHANNELS, true);
  offset += 2;
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, byteRate, true);
  offset += 4;
  view.setUint16(offset, blockAlign, true);
  offset += 2;
  view.setUint16(offset, BITS_PER_SAMPLE, true);
  offset += 2;

  // ── data Sub-chunk ──
  writeString(view, offset, "data");
  offset += 4;
  view.setUint32(offset, dataLength, true);
  offset += 4;

  // Write PCM samples — clamp Float32 [-1, 1] → Int16 [-32768, 32767]
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

/** Write an ASCII string into a DataView at the given byte offset. */
function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
