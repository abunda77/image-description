# Reference Describer

Aplikasi React untuk menghasilkan deskripsi gambar yang ketat dan netral menggunakan Google Gemini API. Aplikasi ini dioptimalkan untuk membuat referensi tekstur, pose, dan pencahayaan tanpa menyebutkan fitur wajah.

## Fitur

- 📤 Upload gambar melalui drag-and-drop atau klik
- 🤖 Generate deskripsi otomatis menggunakan Gemini 2.5 Flash
- 📋 Copy deskripsi ke clipboard dengan satu klik
- 🎯 Constraint khusus untuk menghindari deskripsi wajah/kepala
- 🎨 UI modern dengan Tailwind CSS
- 📱 Responsif untuk berbagai ukuran layar

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool dan dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Google Gemini API** - Image analysis

## Struktur Project

```
image-desc/
├── .env                  # Environment variables (jangan di-commit)
├── .env.example          # Template environment variables
├── .gitignore           # File yang di-ignore git
├── index.html           # HTML entry point
├── package.json         # Dependencies dan scripts
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── public/              # Static assets
├── src/
│   ├── components/
│   │   └── ImageDescriber.jsx  # Komponen utama
│   ├── App.jsx          # Root component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles dengan Tailwind
```

## Instalasi

1. Clone repository ini:
```bash
git clone <repository-url>
cd image-desc
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
```

4. Edit file `.env` dan masukkan API key Gemini Anda:
```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

Untuk mendapatkan API key, kunjungi: https://makersuite.google.com/app/apikey

## Menjalankan Project

### Development Server
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:5173`

### Build untuk Production
```bash
npm run build
```
File build akan ada di folder `dist`

### Preview Production Build
```bash
npm run preview
```

## Cara Penggunaan

1. Buka aplikasi di browser
2. Upload gambar dengan cara:
   - Drag and drop gambar ke area upload, atau
   - Klik area upload untuk memilih file
3. Klik tombol "Generate Description"
4. Tunggu proses analisis selesai
5. Deskripsi akan muncul di panel kanan
6. Klik "Copy" untuk menyalin deskripsi ke clipboard

## Constraint Deskripsi

Aplikasi ini menghasilkan deskripsi dengan constraint berikut:

### ❌ Tidak Menyebutkan:
- Wajah, kepala, mata, hidung, mulut, telinga
- Rambut, gaya rambut, warna rambut
- Etnisitas, warna kulit wajah, usia, ekspresi wajah

### ✅ Fokus Pada:
- Postur tubuh
- Pakaian (detail)
- Aksesoris
- Aksi/aktivitas
- Objek
- Lingkungan
- Pencahayaan
- Atmosfer
- Perspektif

## Format Output

Deskripsi akan selalu dimulai dengan:
```
[subject] "(image reference)" [deskripsi detail]
```

Contoh:
```
a woman "(image reference)" wearing a dark blue leather jacket standing against a brick wall with soft natural light...
```

## Troubleshooting

### Error: "Failed to generate description"
- Pastikan API key valid dan belum expired
- Cek koneksi internet
- Pastikan format gambar didukung (JPG, PNG, GIF, dll)

### Tailwind CSS tidak bekerja
- Pastikan file `src/index.css` berisi directive Tailwind
- Restart dev server setelah mengubah konfigurasi

## License

MIT

## Contributing

Contributions are welcome! Silakan buat pull request atau issue untuk fitur baru dan bug reports.
