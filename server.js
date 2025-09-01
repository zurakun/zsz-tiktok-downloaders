// File: server.js (Versi Final dengan Cheerio Scraper)

const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const qs = require('qs');
const cheerio = require('cheerio'); // Impor cheerio yang baru di-install

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Fungsi scraper yang di-upgrade menggunakan Cheerio
async function tikdownloader(tiktokUrl) {
  try {
    const postData = {
      id: tiktokUrl,
      locale: 'id',
      tt: 'N3E5NWI4'
    };
    
    const response = await axios.post('https://ssstik.io/abc?url=dl', qs.stringify(postData), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
      }
    });

    // Gunakan Cheerio untuk mem-parsing HTML
    const $ = cheerio.load(response.data);

    const title = $('.maintext').text() || 'Untitled';
    
    // Cari link menggunakan selector class yang lebih stabil
    const noWatermarkUrl = $('.without_watermark').attr('href');
    const mp3Url = $('.music').attr('href');

    if (!noWatermarkUrl && !mp3Url) {
      throw new Error('Gagal mengekstrak link download. Video mungkin bersifat privat atau URL tidak valid.');
    }

    return { title, noWatermarkUrl, mp3Url };
  } catch (error) {
    console.error(error); // Menampilkan detail error di konsol server
    return { error: 'Maaf, terjadi kesalahan saat mencoba mengambil data dari sumber. Silakan coba lagi nanti.' };
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL tidak boleh kosong' });

  const result = await tikdownloader(url);
  if (result.error) return res.status(500).json(result);
  
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});