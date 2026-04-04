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
            const sutcular = await User.find({ rol: 'sutcu' });
            console.log('--- SUTUCLER ---');
            sutcular.forEach(s => {
                console.log(`Email: ${s.email}, Parent: ${s.parentUserId}`);
            });

            const ciftciler = await User.find({ rol: 'ciftci' });
            console.log('--- CIFTCI LER ---');
            ciftciler.forEach(c => {
                console.log(`Email: ${c.email}, ID: ${c._id}`);
            });
        } catch (err) {
            console.error(err);
        } finally {
            process.exit(0);
        }
    });
