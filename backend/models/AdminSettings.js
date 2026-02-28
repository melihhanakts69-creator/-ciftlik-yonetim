const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now }
});

adminSettingsSchema.pre('save', function (next) { this.updatedAt = new Date(); next(); });

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
