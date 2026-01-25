import { toast } from 'react-toastify';

// Toast helper fonksiyonları - Profesyonel bildirimler için

/**
 * Başarılı işlemler için yeşil toast
 * @param {string} message - Gösterilecek mesaj
 */
export const showSuccess = (message) => {
    toast.success(message, {
        icon: '✅'
    });
};

/**
 * Hata durumları için kırmızı toast
 * @param {string} message - Gösterilecek mesaj
 */
export const showError = (message) => {
    toast.error(message, {
        icon: '❌'
    });
};

/**
 * Uyarılar için sarı toast
 * @param {string} message - Gösterilecek mesaj
 */
export const showWarning = (message) => {
    toast.warning(message, {
        icon: '⚠️'
    });
};

/**
 * Bilgilendirme için mavi toast
 * @param {string} message - Gösterilecek mesaj
 */
export const showInfo = (message) => {
    toast.info(message, {
        icon: 'ℹ️'
    });
};
