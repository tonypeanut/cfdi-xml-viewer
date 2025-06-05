const express = require('express');
const multer = require('multer');
const { parseCFDI } = require('./services/cfdiParser');
const cors = require('cors');
const app = express();
const port = 3001;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors({
  origin: 'http://localhost:4200', // o usa '*' si solo estás desarrollando
  credentials: true
}));

app.post('/api/process-xml', upload.array('xmlFiles'), async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});