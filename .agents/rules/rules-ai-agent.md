# AI Agent Rules

## Scope & Minimalism
- Tulis kode paling minimal yang menyelesaikan task, tanpa fitur/abstraksi tambahan di luar yang diminta
- Jangan refactor atau merapikan kode lain yang tidak diminta
- Jangan generate ulang seluruh file jika hanya perlu ubah beberapa baris — gunakan diff/patch

## Consistency
- Sebelum menulis kode baru, cek dulu style, naming, dan pattern yang sudah dipakai di codebase
- "Minimal" berarti minimal fitur/kompleksitas, BUKAN mengabaikan dependency, tipe data, atau interface yang sudah ada
- Pastikan kode terintegrasi dengan kode lain dan tidak menyebabkan error

## Process
- Sebelum eksekusi, restate task dalam poin singkat (scope, file yang akan diubah, batasan)
- Jika instruksi ambigu, tanya dulu — jangan asumsi sendiri
- Jika perubahan butuh menyentuh bagian lain agar tidak error, sebutkan dulu sebelum eksekusi

## Analysis Mode
- Jika saya minta "analisis" atau "identifikasi" project, HANYA baca dan jelaskan — JANGAN mengubah, menambah, atau menghapus kode apapun
- Jelaskan struktur folder, alur data/logic, dependency antar file, dan fungsi utama tiap komponen
- Jangan buat file baru atau dokumentasi otomatis kecuali diminta eksplisit (kecuali PROJECT_NOTES.md, lihat bagian di bawah)
- Mode ini murni read-only sampai saya minta implementasi

## Project Notes Maintenance
- Selalu pastikan ada file PROJECT_NOTES.md di root project. Jika belum ada, buat dulu berdasarkan analisis awal codebase — TANPA perlu diperintahkan
- Isi mencakup: struktur folder, alur data/logic utama, dependency antar file/modul, fungsi tiap komponen penting, dan keputusan desain yang relevan
- Setiap ada perubahan/update pada kode (fitur baru, refactor, fix bug yang mengubah alur), WAJIB update bagian terkait di PROJECT_NOTES.md secara spesifik — detail apa yang berubah dan kenapa, bukan rangkuman umum
- Edit hanya bagian yang relevan di PROJECT_NOTES.md tiap update — jangan generate ulang seluruh file
- Di awal setiap sesi baru, sebelum mengerjakan task apapun (analisis, coding, atau fix bug), WAJIB baca PROJECT_NOTES.md dulu sebagai referensi utama

## Output Style
- Tidak perlu komentar kode kecuali diminta
- Tidak perlu penjelasan panjang di luar yang diminta
