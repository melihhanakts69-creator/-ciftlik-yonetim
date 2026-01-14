const mongoose = require('mongoose');
require('dotenv').config(); // Load .env from current dir (backend)
const Inek = require('./models/Inek');
const Duve = require('./models/Duve');
const Buzagi = require('./models/Buzagi');
const SutKaydi = require('./models/SutKaydi');
const User = require('./models/User');

async function debugActivities() {
    try {
        // 1. Connect to DB
        console.log('Connecting to DB...');
        // Hardcoding connection string as fallback
        const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://melihhanaktas:Melih3838@cluster0.b75yq.mongodb.net/ciftlik-yonetim?retryWrites=true&w=majority&appName=Cluster0';

        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        // 2. Find a user with data
        const user = await User.findOne();
        if (!user) {
            console.log('No user found.');
            return;
        }
        console.log(`Found User: ${user.email} (${user._id})`);
        const userId = user._id;

        // 3. Run dashboard queries
        console.log('\n--- Querying Inekler ---');
        const sonInekler = await Inek.find({ userId }).sort({ createdAt: -1 }).limit(5).select('kupeNo isim createdAt').lean();
        console.log('Son İnekler:', sonInekler);

        console.log('\n--- Querying Duveler ---');
        const sonDuveler = await Duve.find({ userId }).sort({ createdAt: -1 }).limit(5).select('kupeNo isim createdAt').lean();
        console.log('Son Düveler:', sonDuveler);

        console.log('\n--- Querying SutKaydi ---');
        const sonSutler = await SutKaydi.find({ userId }).sort({ tarih: -1, createdAt: -1 }).limit(3).select('tarih litre');
        console.log('Son Sütler:', sonSutler);

        // 4. Construct Activity List
        const sonHayvanlar = [
            ...sonInekler.map(h => ({ ...h, tip: 'inek', kupe_no: h.kupeNo })),
            ...sonDuveler.map(h => ({ ...h, tip: 'duve', kupe_no: h.kupeNo })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

        const aktiviteler = [
            ...sonHayvanlar.map(h => ({
                tip: 'hayvan_eklendi',
                tarih: h.createdAt,
                veri: h
            })),
            ...sonSutler.map(s => ({
                tip: 'sut_kaydi',
                tarih: s.tarih,
                veri: { ...s.toObject(), miktar: s.litre }
            }))
        ];

        aktiviteler.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));

        console.log('\n--- Final Activities List ---');
        console.log(JSON.stringify(aktiviteler, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

debugActivities();
