const fs = require('fs');

// Read current AdminPanel.js (clean UTF-8 now)
let content = fs.readFileSync('src/pages/AdminPanel.js', 'utf8');

// 1. Update import line to include MediaSection
content = content.replace(
    "import { DashboardSection, UsersSection, BlogSection, SettingsSection } from './AdminSections';",
    "import { DashboardSection, UsersSection, BlogSection, SettingsSection, MediaSection } from './AdminSections';"
);

// 2. Change 'images' sidebar item to 'media'
content = content.replace(
    "{ key: 'images', label: 'Gorseller', icon: '\\uD83D\\uDDBC\\uFE0F' }",
    "{ key: 'media', label: 'Gorsel Yonetimi', icon: '\\uD83D\\uDDBC\\uFE0F' }"
);

// 3. Replace the entire 'images' active section with a redirect to MediaSection
// Find and remove the old images block, replace with MediaSection render
const oldImgBlock = `        {active === 'images' && <>`;
const newMediaBlock = `        {active === 'media' && <MediaSection API={API} toast_={toast_} />}
        {active === 'images_DISABLED' && <>`;

if (content.includes(oldImgBlock)) {
    content = content.replace(oldImgBlock, newMediaBlock);
    console.log('Replaced images block with MediaSection');
} else {
    // Just add MediaSection render after dashboard
    content = content.replace(
        "{active === 'dashboard' && <DashboardSection API={API} toast_={toast_} />}",
        "{active === 'dashboard' && <DashboardSection API={API} toast_={toast_} />}\n        {active === 'media' && <MediaSection API={API} toast_={toast_} />}"
    );
    console.log('Added media render after dashboard');
}

// Write back without BOM
fs.writeFileSync('src/pages/AdminPanel.js', content, { encoding: 'utf8' });

// Verify
const written = fs.readFileSync('src/pages/AdminPanel.js');
const firstBytes = [...written.slice(0, 5)].map(b => b.toString(16).padStart(2, '0')).join(' ');
console.log('First 5 bytes:', firstBytes);
console.log('Length:', content.length);
console.log('Has MediaSection import:', content.includes('MediaSection'));
console.log('Has media active:', content.includes("active === 'media'"));
