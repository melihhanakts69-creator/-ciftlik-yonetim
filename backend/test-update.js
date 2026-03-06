const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb+srv://melihhanakts69:TqC8yN7f0lIrmSgq@cluster0.p71u2.mongodb.net/ciftlik-db?retryWrites=true&w=majority')
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
