/**
 * Fungsi utilitas untuk mengubah nominal angka menjadi ejaan kalimat Terbilang Rupiah
 * Contoh: 4920676 -> EMPAT JUTA SEMBILAN RATUS DUA PULUH RIBU ENAM RATUS TUJUH PULUH ENAM RUPIAH
 */
export function terbilang(nilai) {
  const angka = Math.abs(Math.round(Number(nilai) || 0));
  if (angka === 0) return 'NOL RUPIAH';

  const satuan = [
    '', 'SATU', 'DUA', 'TIGA', 'EMPAT', 'LIMA',
    'ENAM', 'TUJUH', 'DELAPAN', 'SEMBILAN', 'SEPULUH', 'SEBELAS'
  ];

  function bilang(n) {
    if (n < 12) {
      return satuan[n];
    } else if (n < 20) {
      return bilang(n - 10) + ' BELAS';
    } else if (n < 100) {
      return bilang(Math.floor(n / 10)) + ' PULUH ' + bilang(n % 10);
    } else if (n < 200) {
      return 'SERATUS ' + bilang(n - 100);
    } else if (n < 1000) {
      return bilang(Math.floor(n / 100)) + ' RATUS ' + bilang(n % 100);
    } else if (n < 2000) {
      return 'SERIBU ' + bilang(n - 1000);
    } else if (n < 1000000) {
      return bilang(Math.floor(n / 1000)) + ' RIBU ' + bilang(n % 1000);
    } else if (n < 1000000000) {
      return bilang(Math.floor(n / 1000000)) + ' JUTA ' + bilang(n % 1000000);
    } else if (n < 1000000000000) {
      return bilang(Math.floor(n / 1000000000)) + ' MILYAR ' + bilang(n % 1000000000);
    } else if (n < 1000000000000000) {
      return bilang(Math.floor(n / 1000000000000)) + ' TRILIUN ' + bilang(n % 1000000000000);
    }
    return '';
  }

  const hasil = bilang(angka).replace(/\s+/g, ' ').trim();
  return `${hasil} RUPIAH`;
}
