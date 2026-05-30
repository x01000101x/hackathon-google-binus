# hackathon-google-binus

# MBG UMKM WEB

Sistem **MBG UMKM** adalah platform *Business Intelligence* berbasis terminal web yang dirancang khusus untuk memonitor arus kas, manajemen inventaris, analisis tren pasar secara *real-time*, dan generator konten pemasaran berbasis AI.

---

## 1. Panduan Menjalankan Aplikasi Secara Lokal

### Prasyarat
- **Node.js** (v16+)
- **Go** (v1.18+)
- **MySQL** (untuk database)

### Langkah-langkah
1. **Database Setup**:
   - Jalankan MySQL dan buat database baru bernama `umkm_dashboard`.
   - Pastikan koneksi DB di `main.go` sudah sesuai dengan kredensial lokal Anda.
2. **Backend**:
   - Masuk ke direktori backend.
   - Jalankan perintah: `go run main.go`.
3. **Frontend**:
   - Masuk ke direktori frontend (`src`).
   - Jalankan: `npm install`.
   - Jalankan: `npm run dev`.
4. **Akses**: Buka `http://localhost:5173` di browser Anda.

---

## 2. Daftar Dependensi & Teknologi

### Backend
- **Go (Golang)**: Bahasa pemrograman utama.
- **Fiber**: Framework web untuk Go.
- **GORM**: ORM untuk interaksi database MySQL.
- **MySQL**: Penyimpanan data utama.

### Frontend
- **React**: Library UI.
- **Chart.js & React-chartjs-2**: Visualisasi data (Bar, Doughnut, Bubble Chart).
- **Vite**: Build tool.

---

## 3. Cara Menjalankan Fitur Utama

- **Dashboard Overview**: Menampilkan visualisasi data keuangan, stok, dan peta radar tren pasar secara otomatis saat aplikasi dimuat.
- **Finance**: Input pemasukan/pengeluaran melalui tab **[ FINANCE ]** untuk memperbarui matriks arus kas.
- **Inventory**: Tambahkan atau kelola data produk di tab **[ INVENTORY ]**.
- **Market Trends**: Masukkan kata kunci, persentase pertumbuhan, dan volume pencarian melalui tab **[ TRENDS ]**. Data akan otomatis terpetakan di *Bubble Chart* Dashboard.
- **Neural Copywriter (AI Marketing)**: Masukkan nama produk, fitur, dan pilih gaya bahasa (Profesional/Santai/Cyberpunk) di tab **[ MARKETING ]** untuk menghasilkan draf konten promosi secara instan.
