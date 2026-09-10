// Utility functions for the app

/**
 * Format price in Indian currency format
 * @param {number} amount - Amount to format
 * @returns {string} Formatted price string
 */
export const formatPrice = amount => {
    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(2)} Lakh`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhone = phone => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone number
 */
export const isValidPhone = phone => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 && /^[6-9]/.test(cleaned);
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
};

/**
 * Get time ago string from date
 * @param {string|Date} date - Date to convert
 * @returns {string} Time ago string
 */
export const getTimeAgo = date => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (minutes > 0) {
        return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
};
