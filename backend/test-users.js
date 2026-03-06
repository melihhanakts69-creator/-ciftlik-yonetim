const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb+srv://melihhanakts69:TqC8yN7f0lIrmSgq@cluster0.p71u2.mongodb.net/ciftlik-db?retryWrites=true&w=majority')
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
