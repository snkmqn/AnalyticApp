require("dotenv").config();
const express = require('express');
const connectToDatabase = require('./config/connection');
const Measurement = require('./models/schema');
const app = express();
const path = require('path');
const PORT = process.env.PORT;


connectToDatabase();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/measurements', async (req, res) => {
    const { field, start_date, end_date } = req.query;
    const validFields = ['population', 'GDP', 'lifeExpectancy'];

    if (!field || !validFields.includes(field)) {
        return res.status(400).json({
            error: 'Invalid field specified. Please choose between population, GDP, or lifeExpectancy.'
        });
    }

    if (!start_date || !end_date) {
        return res.status(400).json({
            error: 'Missing required query parameters: start_date, end_date'
        });
    }

    try {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).json({
                error: 'Invalid date format. Please provide dates in a valid format (e.g., YYYY-MM-DD).'
            });
        }

        if (startDate > endDate) {
            return res.status(400).json({
                error: 'Start date cannot be later than end date.'
            });
        }

        const measurements = await Measurement.find({
            timestamp: { $gte: startDate, $lte: endDate },
            [field]: { $exists: true }
        }).select('timestamp ' + field);

        if (measurements.length === 0) {
            return res.status(404).json({
                error: 'No data found for the specified range and field.'
            });
        }

        res.json(measurements);
    } catch (err) {
        res.status(500).json({
            error: 'Internal server error while fetching data.'
        });
    }
});

app.get('/api/measurements/metrics', async (req, res) => {
    const { field } = req.query;
    const validFields = ['population', 'GDP', 'lifeExpectancy'];

    if (!field || !validFields.includes(field)) {
        return res.status(400).json({
            error: 'Invalid field specified. Please choose between population, GDP, or lifeExpectancy.'
        });
    }

    try {
        const measurements = await Measurement.find({ [field]: { $exists: true } }).select(field);

        if (measurements.length === 0) {
            return res.status(404).json({
                error: 'No data found for the specified field.'
            });
        }

        const values = measurements.map(measurement => measurement[field]);
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length);

        res.json({ avg, min, max, stdDev });
    } catch (err) {
        res.status(500).json({
            error: 'Internal server error while calculating metrics.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
