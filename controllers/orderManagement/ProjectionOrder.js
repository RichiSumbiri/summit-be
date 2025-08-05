export const postProjectionOrder = async(req,res) => {
    try {
        const { DataPRJ } = req.body;
        console.log(DataPRJ);
        return res.status(200).json({
            success: true,
            message: "success post projection order"
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post projection order"
        });
    }
}