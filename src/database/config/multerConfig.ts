// src/config/multerConfig.ts

import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Define o diretório onde as imagens serão salvas
const diretorioDestino = path.resolve(__dirname, '..', '..', 'public', 'uploads');

export const multerConfig = {
  dest: diretorioDestino,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, diretorioDestino);
    },
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err, file.originalname);

        const fileName = `${hash.toString('hex')}-${file.originalname}`;
        cb(null, fileName);
      });
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const tiposPermitidos = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif'];

    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido.'));
    }
  },
};