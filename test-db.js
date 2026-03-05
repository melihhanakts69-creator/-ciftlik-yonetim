const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Inek = require('./backend/models/Inek');

mongoose.connect('mongodb+srv://melihhanakts69:TqC8yN7f0lIrmSgq@cluster0.p71u2.mongodb.net/ciftlik-db?retryWrites=true&w=majority')
    .then(async () => {
        try {
            const u = await User.findOne({ rol: 'sutcu' });
            if (!u) {
                console.log('Sutcu yok');
            } else {
                console.log('Sutcu _id:', u._id, ' parent:', u.parentUserId);

                let inekSayisiString = 0;
                let inekSayisiObjectId = 0;

                if (u.parentUserId) {
                    const parentIdStr = u.parentUserId.toString();
                    inekSayisiString = await Inek.countDocuments({ userId: parentIdStr });
                    inekSayisiObjectId = await Inek.countDocuments({ userId: new mongoose.Types.ObjectId(parentIdStr) });

                    console.log('Inek sayisi (String arama):', inekSayisiString);
                    console.log('Inek sayisi (ObjectId arama):', inekSayisiObjectId);

                    // Inek'teki typical bir veri
                    const ornekInek = await Inek.findOne();
                    if (ornekInek) console.log('Ornek Inek userId tipi:', typeof ornekInek.userId, 'degeri:', ornekInek.userId);
                } else {
                    console.log('Sutcu kullanicisinin parentUserId si yok!');
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            process.exit(0);
        }
    });
