import dotenv from 'dotenv';
import url from 'url';
import app, {
  parseLaporanPerTanggal,
  parseTutupHarian,
  parseSmartRingkasan,
  parseLaporanPerStruk,
  parseLaporanPerMember,
  classifyEntitas,
  isElectronicWallet,
  buildOmsetRows,
  calculateTotals,
  runValidations,
  generateExcel
} from './api/index.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const isDirectRun = process.argv[1] && (url.fileURLToPath(import.meta.url) === process.argv[1] || process.argv[1].endsWith('server.js'));

if (isDirectRun && (process.env.NODE_ENV !== 'production' || !process.env.VERCEL)) {
  app.listen(PORT, () => {
    console.log(`✅ LaporGo server running → http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
  });
}

export {
  parseLaporanPerTanggal,
  parseTutupHarian,
  parseSmartRingkasan,
  parseLaporanPerStruk,
  parseLaporanPerMember,
  classifyEntitas,
  isElectronicWallet,
  buildOmsetRows,
  calculateTotals,
  runValidations,
  generateExcel
};

export default app;
