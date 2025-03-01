const mongoose = require('mongoose');

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Successfully connected to MongoDB database');
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
};

module.exports = connectToDatabase;
