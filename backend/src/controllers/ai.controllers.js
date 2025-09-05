const aiService = require("../services/ai.services");

module.exports.getResponse = async (req, res) => {
    try {
        const code = req.body.code;
        
        if (!code) {
            return res.status(400).json({ error: "Code is required" });
        }
        
        const response = await aiService(code);
        res.json({ review: response });
    } catch (error) {
        console.error('Error in getResponse:', error);
        res.status(500).json({ error: "Failed to get code review" });
    }
};
