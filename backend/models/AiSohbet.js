const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'model'],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const AiSohbetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        default: 'Yeni Sohbet'
    },
    type: {
        type: String,
        enum: ['yem', 'saglik', 'genel'],
        required: true
    },
    messages: [MessageSchema] // Geçmiş mesajlar burada tutulacak
}, { timestamps: true });

module.exports = mongoose.model('AiSohbet', AiSohbetSchema);
