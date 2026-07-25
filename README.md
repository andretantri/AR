# AR Explorer 🌐🚀

AR Explorer adalah platform Content Management System (CMS) dan WebAR Viewer interaktif berbasis **Laravel, React, Inertia.js, dan React Three Fiber (R3F)**. Platform ini memungkinkan administrator untuk mengelola konten 3D dan menghadirkan pengalaman Augmented Reality (AR) langsung melalui browser tanpa memerlukan aplikasi tambahan.

## Fitur Utama ✨

### 1. 3D Visual Editor (Sisi Admin)
- Editor ruang 3D interaktif berbasis React Three Fiber.
- Memungkinkan admin untuk mengunggah berbagai model 3D (format `.glb` dan `.gltf`).
- Memiliki kontrol transformasi visual (Gizmo Transform) untuk **Menggeser (Translate)**, **Memutar (Rotate)**, dan **Mengubah Skala (Scale)** setiap objek 3D.
- Pengaturan posisi yang presisi melalui input angka.

### 2. True WebAR Camera Tracking
Didukung oleh **MindAR**, platform ini menghadirkan pengalaman WebAR sungguhan:
- **Image Tracking**: Menggunakan gambar *thumbnail* dari konten sebagai pelacak (target marker). AR akan muncul persis di atas gambar yang dipindai melalui smartphone pengguna.
- **Standard Marker Tracking**: Menyediakan "Marker Standar" beresolusi tinggi yang bisa diunduh dan dicetak untuk digunakan sebagai pelacak generik.
- **Auto-Compilation**: Sistem secara otomatis mengkompilasi target gambar ke dalam format `.mind` di latar belakang langsung pada Dashboard Admin.

### 3. Interactive Public 3D Viewer
- Penampil 3D publik yang memukau dengan pencahayaan dinamis (HDRI Environment) dan bayangan (Contact Shadows).
- Label interaktif cerdas (HTML Popups) yang otomatis muncul tepat di atas (ubun-ubun) setiap objek 3D ketika diklik, menampilkan detail dan deskripsi model tersebut (termasuk komputasi Bounding Box otomatis).

### 4. CMS Modern & Cepat
- Dashboard admin yang responsif dan sangat cepat karena berbasis SPA (Single Page Application) menggunakan **Inertia.js + React**.
- Desain antarmuka (UI/UX) memukau dengan balutan *glassmorphism* dan *Tailwind CSS*.

## Tech Stack 🛠️
- **Backend:** Laravel 11, MySQL / SQLite
- **Frontend:** React 18, Inertia.js, Tailwind CSS
- **3D & WebAR Engine:** 
  - `three` (Three.js)
  - `@react-three/fiber` (R3F)
  - `@react-three/drei` (Utilitas R3F)
  - `mind-ar` (WebAR Image Tracking Engine)

## Instalasi & Menjalankan Proyek 💻

1. **Clone repositori**
   ```bash
   git clone https://github.com/andretantri/AR.git
   cd AR
   ```

2. **Instal dependensi Backend (PHP/Laravel)**
   ```bash
   composer install
   ```

3. **Instal dependensi Frontend (NPM)**
   ```bash
   npm install
   # Atau jika menggunakan legacy-peer-deps:
   npm install --legacy-peer-deps
   ```

4. **Konfigurasi Environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Atur koneksi database Anda di dalam file `.env`.

5. **Migrasi Database & Seeding**
   ```bash
   php artisan migrate --seed
   ```
   *Seeder akan membuat akun Admin awal.*

6. **Tautkan Storage**
   ```bash
   php artisan storage:link
   ```

7. **Jalankan Server Development**
   Jalankan perintah berikut di dua terminal yang berbeda:
   ```bash
   # Terminal 1: Menjalankan Laravel Backend
   php artisan serve

   # Terminal 2: Menjalankan Vite Frontend
   npm run dev
   ```

8. **Akses Aplikasi**
   Buka `http://127.0.0.1:8000` di browser Anda.
   - Halaman Publik: `/`
   - Halaman Admin: `/admin`

---
*Dibangun dengan dedikasi tinggi untuk menghadirkan pengalaman AR Web masa depan!* 🚀
