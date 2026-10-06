# Tiko — pengunduh video TikTok

Situs pengunduh video TikTok dengan UI berbahasa Indonesia. Frontend menggunakan React + Vite; API Node.js menggunakan Express 5 dan yt-dlp. Frontend produksi disajikan oleh Express pada origin yang sama dengan API.

## Menjalankan lokal

1. Pasang Node.js 22 atau versi LTS yang memenuhi `package.json`.
2. Pasang [yt-dlp](https://github.com/yt-dlp/yt-dlp/wiki/Installation). MP3 dan MP4 HD juga memerlukan FFmpeg.
3. Jalankan `npm ci`.
4. Jalankan `npm run dev` lalu buka `http://localhost:5173`. Vite meneruskan permintaan `/api` ke Express di port 3000.
5. Untuk mode produksi lokal, jalankan `npm run build`, lalu `npm start` dan buka `http://localhost:3000`.

Jika executable tidak terdeteksi lewat PATH, atur `YTDLP_PATH` dan/atau `FFMPEG_PATH`. Port server dapat diubah lewat `PORT`.

## API

- `GET /api/health` — status yt-dlp dan FFmpeg.
- `GET /api/info?url=...` — metadata video.
- `GET /api/download?format=mp4|hd|mp3&url=...` — unduh MP4 standar, MP4 HD, atau audio MP3.

MP4 standar memilih resolusi sampai 720 piksel tinggi jika tersedia; jika tidak, server memilih format MP4 dengan resolusi terendah yang diketahui. HD memilih resolusi MP4 tertinggi yang dapat digabungkan. Jika sumber tidak menyediakan resolusi lebih tinggi dari standar, tombol HD dinonaktifkan dan halaman hasil menjelaskan alasannya.

URL hanya menerima HTTPS dari host TikTok yang diizinkan. Permintaan metadata/unduhan dibatasi per IP dan jumlah proses yt-dlp serentak dibatasi. Atur `API_RATE_LIMIT`, `DOWNLOAD_RATE_LIMIT`, `MAX_CONCURRENT_JOBS`, dan `DOWNLOAD_TIMEOUT_MS` jika perlu. Saat berjalan di balik satu reverse proxy tepercaya (seperti Render), aktifkan `TRUST_PROXY=true` agar pembatasan per IP memakai alamat klien.

Video privat, video yang memerlukan login, dan sebagian tautan pendek mungkin tidak tersedia. Unduh hanya konten yang kamu miliki atau berhak gunakan; hormati hak cipta dan ketentuan layanan TikTok.

## Deploy

Render memakai Docker multi-stage: build frontend Vite dan dependency pengembangan tinggal di stage build, sedangkan image runtime hanya membawa server Express, hasil build, yt-dlp, dan FFmpeg. Health check memakai `/api/health`.
