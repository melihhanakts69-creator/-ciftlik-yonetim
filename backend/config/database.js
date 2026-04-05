const mongoose = require('mongoose');

// Kritik Emir: Modeller bağlantı beklemeden patlamasın diye
mongoose.set('bufferCommands', false);

const connectDB = async () => {
    try {
        const uri = "mongodb://Melihhan:05465742067m@ac-upiwd66-shard-00-00.faq6tsp.mongodb.net:27017,ac-upiwd66-shard-00-01.faq6tsp.mongodb.net:27017,ac-upiwd66-shard-00-02.faq6tsp.mongodb.net:27017/Agrolina?ssl=true&replicaSet=atlas-m1v6m5-shard-0&authSource=admin&retryWrites=true&w=majority";
        
        await mongoose.connect(uri, {
            family: 4,
            serverSelectionTimeoutMS: 90000,
            connectTimeoutMS: 60000,
            bufferCommands: false
        });

        console.log("🚀 [ANTIGRAVITY_ON] - VERİTABANI BAĞLANDI, MERCEDES YOLA ÇIKTI!");
    } catch (error) {
        console.error("❌ [ANTIGRAVITY_FAIL] - HATA:");
        // Detaylı JSON çıktısı
        console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        process.exit(1);
    }
};

module.exports = connectDB;
