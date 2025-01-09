import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { modelSumbiriEmployee } from "../../models/hr/employe.mod.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadPhotosEmp = async(req, res) => {
  try {
    const fileBuffer    = req.files.file.data; // This is the buffer containing the file data
    const fileName      = req.files.file.name;
    const { nikEmp }    = req.params;
    const filePath      = path.join(__dirname, "../../assets/images/photos", fileName );
    
    fs.writeFile(filePath, fileBuffer, (err) => {
      if (err) {
        console.error("Error saving file:", err);
        return res.status(500).send("Error saving file");
      }
    
      const updatePhotoDB = modelSumbiriEmployee.update({ Photos: fileName }, {
            where: {
              Nik: nikEmp 
          }
      });
    
      if(updatePhotoDB){
        res.json({ message: "success update emp photos" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading file", error: error });
  }
};




export const downloadPhotosEmp = async(req, res) => {
    try {
        const NikEmp        = req.params.nik;
        const getFileName   = await modelSumbiriEmployee.findOne({ where: { Nik: NikEmp }});

        if(getFileName){
            const filePath = path.join( __dirname, "../../assets/images/photos", getFileName.Photos );
              if(filePath){
                res.sendFile(filePath, (err) => {
                  if (err) {
                    res.status(404).send('File not found');
                  }
                });
              } else {
                res.status(404).send('File not found');
              }
        } else {
          res.status(404).send('File not found');
        }
} catch (error) {
      res.status(500).json({ message: "Error download file", error: error });
    }
  };