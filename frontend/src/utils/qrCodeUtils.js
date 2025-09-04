import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  try {
    return await QRCode.toDataURL(data);
  } catch (error) {
    console.error('QR code generation failed:', error);
    return null;
  }
};