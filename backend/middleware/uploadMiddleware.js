// middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Győződj meg róla, hogy ez a mappa létezik: public/schemes
    cb(null, 'public/schemes/'); 
  },
  filename: (req, file, cb) => {
    // A fájlnév az ID lesz, amit a form-ból kapunk (pl. unicorn_v1.png)
    const skinId = req.body.id;
    cb(null, `${skinId}.png`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Csak PNG fájlok engedélyezettek!'), false);
    }
  }
});

module.exports = upload;