export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const DATA_IMAGE_PATTERN =
  /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/;
export const VALIDATION_STATUSES = ["pending", "approved", "rejected"] as const;
