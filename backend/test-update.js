require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is required');
  process.exit(1);
}

mongoose.connect(uri, { serverSelectionTimeoutMS: 30000, family: 4 })
    .then(async () => {
        try {
            const u = await User.findOne({ rol: 'sutcu' });
            if (!u) {
                console.log('Sutcu yok');
            } else {
                u.isim = "Sütçü Test";
                await u.save();
                console.log('Sutcu saved successfully');
            }
        } catch (err) {
            console.error('Save error:', err);
        } finally {
            process.exit(0);
        }
    });
