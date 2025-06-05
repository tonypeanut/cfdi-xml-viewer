const express = require('express');
const multer = require('multer');
const { parseCFDI } = require('./services/cfdiParser');
const cors = require('cors');
const app = express();


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.use(cors({
  origin: [
     'http://localhost:4200',
     'https://cfdi-xml-viewer.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.post('/api/process-xml', upload.array('xmlFiles'), async (req, res) => {

  res.header('Access-Control-Allow-Origin', 'https://cfdi-xml-viewer.netlify.app');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const results = await Promise.all(
    req.files.map(async (file) => {
      try {
        const xmlData = file.buffer.toString('utf8');
        const cfdiData = await parseCFDI(xmlData);
        
        return { 
          fileName: file.originalname, 
          data: cfdiData 
        };
      } catch (e) {
        return { 
          fileName: file.originalname, 
          error: e.message 
        };
      }
    })
  );

  res.json(results);
});

const port = process.env.PORT || 3001;
module.exports = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
