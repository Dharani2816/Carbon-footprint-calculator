const { CarbonFootprint } = require('../models');

exports.saveFootprint = async (req, res) => {
    try {
        const { electricity_emission, transport_emission, diet_emission, lifestyle_emission, total_emission } = req.body;
        
        const footprint = await CarbonFootprint.create({
            user_id: req.user.id,
            electricity_emission,
            transport_emission,
            diet_emission,
            lifestyle_emission,
            total_emission
        });

        res.status(201).json(footprint);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const footprints = await CarbonFootprint.findAll({
            where: { user_id: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(footprints);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getLatestFootprint = async (req, res) => {
    try {
        const footprint = await CarbonFootprint.findOne({
            where: { user_id: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        
        if (!footprint) return res.status(404).json({ message: 'No records found' });
        
        res.json(footprint);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
