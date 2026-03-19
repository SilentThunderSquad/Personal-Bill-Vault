// File type detection and utility functions
export function detectFileTypeFromUrl(url: string | null): 'image' | 'pdf' | null {
  if (!url) return null;

  const lowerUrl = url.toLowerCase();

  // Check for PDF
  if (lowerUrl.includes('.pdf') || lowerUrl.includes('application/pdf')) {
    return 'pdf';
  }

  // Check for images
  if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i)) {
    return 'image';
  }

  // Default to image for unknown types (backward compatibility)
  return 'image';
}

export function getFileNameFromUrl(url: string | null): string {
  if (!url) return 'file';

  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').pop() || 'file';
    // Remove timestamp prefix if it exists (format: timestamp_originalname)
    return filename.replace(/^\d+_/, '');
  } catch {
    return 'file';
  }
}

export function getFileExtensionFromUrl(url: string | null): string {
  const filename = getFileNameFromUrl(url);
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toUpperCase() || '' : '';
}

export async function downloadFile(url: string, filename?: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || getFileNameFromUrl(url);

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Download failed. Please try again.');
  }
}

export function generateThumbnailUrl(url: string | null): string | null {
  if (!url) return null;

  // For Supabase storage, we can add width parameter for image optimization
  // This is a placeholder - in production you'd want proper image optimization
  const fileType = detectFileTypeFromUrl(url);

  if (fileType === 'image') {
    // For images, return the original URL (Supabase doesn't support resize params yet)
    return url;
  }

  // For PDFs, return null (no thumbnail)
  return null;
}