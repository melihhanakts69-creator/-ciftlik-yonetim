const mongoose = require('mongoose');

// Kritik Emir: Modeller bağlantı beklemeden patlamasın diye
mongoose.set('bufferCommands', false);

const connectDB = async () => {
    try {
        // Not: < > isaretleri URL'yi bozmamasi adina kaldirildi. 'Agrolina' veritabani ismi eklendi.
        const uri = "mongodb://Melihhan:05465742067m@ac-bpp7wry-shard-00-00.msexwkw.mongodb.net:27017,ac-bpp7wry-shard-00-01.msexwkw.mongodb.net:27017,ac-bpp7wry-shard-00-02.msexwkw.mongodb.net:27017/Agrolina?ssl=true&replicaSet=atlas-gkhayn-shard-0&authSource=admin&appName=Cluster0";
        
        await mongoose.connect(uri, {
            family: 4,
            serverSelectionTimeoutMS: 90000,
            bufferCommands: false
        });

        console.log('🚀 [ANTIGRAVITY_FINAL] - AGROLINA CANLANDI!');
        return true;
    } catch (error) {
        console.error("❌ HATA:");
        console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        return false;
    }
};

module.exports = connectDB;
