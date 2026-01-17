const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });
const Finansal = require('./backend/models/Finansal');

// Environment variables
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ciftlik-yonetim';

const debugFinancials = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Fetch all financial records
        const records = await Finansal.find({});
        console.log(`📊 Total Financial Records: ${records.length}`);

        if (records.length > 0) {
            console.log('📋 First 5 Records:');
            records.slice(0, 5).forEach(r => {
                console.log({
                    userId: r.userId,
                    tip: r.tip,
                    miktar: r.miktar,
                    tarih: r.tarih,
                    tarihType: typeof r.tarih
                });
            });
        }

        // Check specific aggregation pipeline
        const pipeline = [
            { $group: { _id: null, toplam: { $sum: '$miktar' } } }
        ];
        const result = await Finansal.aggregate(pipeline);
        console.log('💰 Aggregation Result (Global):', result);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected');
        process.exit();
    }
};

debugFinancials();
