const mongoose = require('mongoose');

console.log('🛸 [ANTIGRAVITY_V2] - YENİ PROJE, SIFIR KM BAĞLANTI!');

// Kritik Emir: Modeller bağlantı beklemeden patlamasın diye
mongoose.set('bufferCommands', false);

const connectDB = async () => {
    try {
        const uri = "mongodb://Melihhan:05465742067m@ciftlik-shard-00-00.hq6h6sl.mongodb.net:27017,ciftlik-shard-00-01.hq6h6sl.mongodb.net:27017,ciftlik-shard-00-02.hq6h6sl.mongodb.net:27017/Agrolina?ssl=true&authSource=admin&retryWrites=true&w=majority";
        
        await mongoose.connect(uri, {
            family: 4,
            serverSelectionTimeoutMS: 90000,
            connectTimeoutMS: 60000,
            bufferCommands: false
        });

        console.log('✅ [MERCEDES_CALISTI] - AGROLINA ONLINE!');
    } catch (error) {
        console.error("❌ HATA:");
        console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        process.exit(1);
    }
};

module.exports = connectDB;
