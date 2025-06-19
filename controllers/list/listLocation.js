import { MasterLocation } from "../../models/list/masterLocation.js";


export const getMasterLocation = async(req,res) => {
    try {
        const Locations = await MasterLocation.findAll({});
        if (Locations.length === 0) {
            return res.status(404).json({ message: "No locations found" });
        } else {
            return res.status(200).json({
                    success: true,
                    message: `success get master locations`,
                    data: Locations
            });
        }
    } catch(err){
        console.error("Error fetching locations:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
