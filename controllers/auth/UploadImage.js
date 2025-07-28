import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

export const uploadImageController = async (req, res) => {
    try {
        const file = req.files?.file;
        const folderName = req.files.folder || null;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file provided for upload",
            });
        }

        // Resolve __dirname for ESM
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const dynamicFolder = folderName || "itemId";
        const uploadPath = path.join(__dirname, "../../assets/images", dynamicFolder);

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        const ext = path.extname(file.name);
        const baseName = path.basename(file.name, ext);
        const uuid = uuidv4();
        const uniqueFileName = `${uuid}_${baseName}${ext}`;

        const filePath = path.join(uploadPath, uniqueFileName);

        await fs.promises.writeFile(filePath, file.data);

        const relativePath = path.join(dynamicFolder, uniqueFileName).replace(/\\/g, "/");

        return res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            data: {
                fileName: uniqueFileName,
                filePath: relativePath,
            },
        });
    } catch (error) {
        console.error("Error uploading image:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to upload file",
            error: error.message,
        });
    }
};