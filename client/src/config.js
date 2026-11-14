// Workshop WhatsApp number, international format, digits only (e.g. 96170123456).
// Set VITE_WHATSAPP_NUMBER in client/.env.development (local) and in Vercel (online).
// Default: the workshop number (+961 71 99 33 78). VITE_WHATSAPP_NUMBER can override it.
export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || '96171993378').replace(/\D/g, '');

export const whatsappLink = (text = '') =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
