const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
    res.send('Server Timpa Teks AI (OpenAI Edition) berjalan!');
});

app.post('/api/generate-ai', async (req, res) => {
    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'Server tidak dikonfigurasi dengan benar (API Key tidak ada).' });
    }
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ error: 'Gambar tidak ditemukan.' });
        }

        // PROMPT BARU DENGAN PERMINTAAN SARAN FONT
        const prompt = `Analisis gambar ini. Identifikasi blok teks utama di dalamnya. Konteksnya kemungkinan besar sedih atau dramatis. Tugasmu adalah membuat teks baru yang lucu, absurd, atau tidak nyambung untuk menimpa teks asli (gaya meme 'timpa teks' atau 'doksli' Indonesia). Berikan jawaban HANYA dalam format JSON yang valid dengan struktur: {"new_text": "teks lucu buatanmu", "bbox": {"x": N, "y": N, "width": N, "height": N}, "font_suggestion": "deskripsi singkat gaya font yang cocok"}. Contoh font_suggestion: 'Gunakan font gaya horor', 'Coba font tulisan tangan yang santai', 'Font tebal dan besar cocok di sini'. JANGAN berikan penjelasan atau teks lain, hanya JSON. Bounding box (bbox) harus berupa perkiraan lokasi teks asli di gambar.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageBase64,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 300,
            response_format: { type: "json_object" },
        });
        
        const jsonResponse = JSON.parse(response.choices[0].message.content);
        res.json(jsonResponse);

    } catch (error) {
        console.error('Error di sisi server OpenAI:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memproses dengan AI OpenAI.' });
    }
});

app.listen(port, () => {
    console.log(`Server OpenAI berjalan di port ${port}`);
});
