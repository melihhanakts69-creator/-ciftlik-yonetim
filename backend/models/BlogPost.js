const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    excerpt: { type: String, trim: true, maxlength: 300 },
    content: { type: String, required: true },
    imageUrl: { type: String, trim: true },
    published: { type: Boolean, default: false },
    publishDate: { type: Date, default: Date.now },
    author: { type: String, default: 'Agrolina Admin', trim: true },
    tags: [{ type: String }],
}, { timestamps: true });

// Slug otomatik oluştur
blogPostSchema.pre('save', function (next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-');
    }
    next();
});

module.exports = mongoose.model('BlogPost', blogPostSchema);
