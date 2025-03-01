const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
    timestamp: { type: Date, required: true },
    GDP: { type: Number, required: true },
    population: { type: Number, required: true },
    lifeExpectancy: { type: Number, required: true }
}, { collection: 'worldbank' });

const Measurement = mongoose.model('Measurement', measurementSchema);

module.exports = Measurement;
