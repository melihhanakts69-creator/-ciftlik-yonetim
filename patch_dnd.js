const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminSections.js', 'utf8');

const uploaderCode = `
const ImageUploader = ({ value, onChange, icon }) => {
    const [dragging, React_useState] = useState(false); // using existing React imports from scope
    const [loading, setLoading] = useState(false);

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        setLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                const maxW = 1200;
                if (width > maxW) { height = Math.round(height * (maxW / width)); width = maxW; }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                onChange(canvas.toDataURL('image/jpeg', 0.85));
                setLoading(false);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div 
            style={{ 
                height: 130, position: 'relative', overflow: 'hidden', cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: dragging ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.02)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', transition: 'all 0.2s'
            }}
            onDragOver={e => { e.preventDefault(); React_useState(true); }}
            onDragLeave={() => React_useState(false)}
            onDrop={e => { e.preventDefault(); React_useState(false); handleFile(e.dataTransfer.files[0]); }}
            title="Gorseli degistirmek icin tikla veya surukle"
            onClick={() => {
                const input = document.createElement('input');
                input.type = 'file'; input.accept = 'image/*';
                input.onchange = e => handleFile(e.target.files[0]);
                input.click();
            }}
        >
            {value ? (
                <>
                    <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: dragging ? 0.3 : 0.9 }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', opacity: dragging ? 1 : 0, transition: 'opacity 0.2s', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                        {loading ? 'Isleniyor...' : 'Birak Guncelsin 🚀'}
                    </div>
                </>
            ) : (
                <>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{loading ? '⏳' : icon || '📁'}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '0 10px', lineHeight: 1.3 }}>
                        {loading ? 'Goruntu isleniyor...' : 'Buraya surukle veya\\n secmek icin tikla'}
                    </div>
                </>
            )}
        </div>
    );
};

const STATIC_SLOTS`;

content = content.replace("const STATIC_SLOTS", uploaderCode);

// Replace static slots rendering
const oldStaticSlotRender = `                            {images[slot.key]
                                ? <img src={images[slot.key]} alt={slot.label} onError={e => e.target.style.display = 'none'} />
                                : <div className="placeholder">{slot.icon}</div>
                            }`;

const newStaticSlotRender = `                            <ImageUploader 
                                value={images[slot.key]} 
                                icon={slot.icon} 
                                onChange={base64 => setImages(p => ({ ...p, [slot.key]: base64 }))} 
                            />`;

content = content.replace(oldStaticSlotRender, newStaticSlotRender);

// Add ImageUploader to News item too
const oldNewsImg = `                    {newNews.imageUrl && (
                        <img src={newNews.imageUrl} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
                    )}`;

const newNewsImg = `                    <div style={{ marginTop: 8 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Gorsel Yukle (Surukle Birak)</label>
                        <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <ImageUploader 
                                value={newNews.imageUrl} 
                                icon="🖼️"
                                onChange={base64 => setNewNews(p => ({ ...p, imageUrl: base64 }))} 
                            />
                        </div>
                    </div>`;

content = content.replace(oldNewsImg, newNewsImg);

fs.writeFileSync('src/pages/AdminSections.js', content, 'utf8');
console.log('AdminSections.js successfully updated with drag & drop!');
