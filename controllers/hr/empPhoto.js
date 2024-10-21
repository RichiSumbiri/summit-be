// controllers/uploadController.js
import multer from 'multer';
import path from 'path';
import ModelUploadEmpPhoto from '../../models/hr/photos.js';

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'assets/images/photos'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

export const uploadPhotosMid = multer({ storage });

// File upload handler
export const uploadFileEmpPhoto = (req, res) => {
    try {
        console.log(req);
        res.status(200).json({ message: 'Success uploading file'});
    } catch(err){
        res.status(500).json({ message: 'Error uploading file', error: err });
    }
    
    
    //     console.log(req.files);
//     upload.single('file')(req, res, (err) => {
//     if (err) {
//         console.error(err);
//         return res.status(500).json({ message: 'Error uploading file', error: err });
//     }
    
//     const uploadedFile = new ModelUploadEmpPhoto(req.files.file.path);
    
//     res.status(200).json({ message: 'File uploaded successfully', file: uploadedFile });
//   });
};

// export { uploadFileEmpPhoto };
