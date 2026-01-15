
// NOTE: This is a client-side implementation of image security analysis.
// 'sharp' is a Node.js library and cannot be run directly in the browser.
// We manually parse JPEG binary markers and EXIF tags to achieve the requested security checks.

export const validateImageMiddleware = async (file: File): Promise<{ valid: boolean; warning?: string; error?: string }> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const dataView = new DataView(arrayBuffer);

    // 1. Check for JPEG SOI marker (FF D8)
    // If not JPEG, we can't easily check EXIF in this lightweight parser.
    // We flag it as "Low Confidence" as per instructions for missing EXIF data context.
    if (dataView.getUint16(0) !== 0xFFD8) {
      // Some valid images (PNG, etc.) might fall here. 
      // strict rule: exif데이터가 없으면 -> warning
      return { valid: true, warning: '신뢰도 낮은 파일입니다.' };
    }

    let offset = 2;
    let exifFound = false;
    let software: string | null = null;

    while (offset < dataView.byteLength) {
      // Check for valid marker (FF xx)
      if (dataView.getUint8(offset) !== 0xFF) break;

      const marker = dataView.getUint8(offset + 1);
      
      // SOS (Start of Scan) - actual image data begins, metadata ended
      if (marker === 0xDA) break;

      // APP1 Marker (FF E1) - usually contains Exif
      if (marker === 0xE1) {
        // Check for "Exif\0\0" signature
        // 2 bytes marker, 2 bytes length, 4 bytes "Exif", 2 bytes "\0\0"
        if (dataView.byteLength >= offset + 10 && 
            dataView.getUint32(offset + 4) === 0x45786966 && 
            dataView.getUint16(offset + 8) === 0x0000) {
           
           exifFound = true;
           // Parse TIFF data inside APP1 to find Software tag
           software = parseExifSoftware(dataView, offset + 10);
        }
        break; // We found the EXIF block, no need to scan further
      }

      // Move to next marker
      const length = dataView.getUint16(offset + 2);
      offset += 2 + length;
    }

    // 2. Check if EXIF exists
    if (!exifFound) {
      return { valid: true, warning: '신뢰도 낮은 파일입니다.' };
    }

    // 3. Check Software Tag for Editing Software
    if (software) {
      const editingKeywords = [
        'photoshop', 'gimp', 'lightroom', 'paint', 
        'canvas', 'editor', 'pixlr', 'snapseed', 'illustrator'
      ];
      const lowerSoftware = software.toLowerCase();
      
      if (editingKeywords.some(keyword => lowerSoftware.includes(keyword))) {
        return { valid: false, error: '수정된 이미지입니다.' };
      }
    }

    return { valid: true };

  } catch (e) {
    console.error("Image security analysis failed:", e);
    // Fail safe: warn user
    return { valid: true, warning: '신뢰도 낮은 파일입니다.' };
  }
};

function parseExifSoftware(dataView: DataView, tiffStart: number): string | null {
  try {
    // TIFF Header
    // Bytes 0-1: Byte Order (0x4949 = II = Little Endian, 0x4D4D = MM = Big Endian)
    const byteOrder = dataView.getUint16(tiffStart);
    const littleEndian = byteOrder === 0x4949;

    // Bytes 4-7: Offset to 0th IFD
    const firstIFDOffset = dataView.getUint32(tiffStart + 4, littleEndian);
    
    if (firstIFDOffset < 8) return null;

    const dirStart = tiffStart + firstIFDOffset;
    // Number of entries
    const entries = dataView.getUint16(dirStart, littleEndian);

    for (let i = 0; i < entries; i++) {
      const entryOffset = dirStart + 2 + (i * 12);
      const tag = dataView.getUint16(entryOffset, littleEndian);

      // Tag 0x0131 (305) is "Software"
      if (tag === 0x0131) {
        const type = dataView.getUint16(entryOffset + 2, littleEndian); // Type 2 = ASCII
        const count = dataView.getUint32(entryOffset + 4, littleEndian);
        const valueOffset = dataView.getUint32(entryOffset + 8, littleEndian);

        if (type === 2) {
           // Value is at tiffStart + valueOffset
           // Or if count <= 4, it's inside valueOffset bytes (but usually Software string is longer)
           let strOffset = tiffStart + valueOffset;
           // Safety check
           if (strOffset + count > dataView.byteLength) return null;

           let str = '';
           for (let j = 0; j < count && j < 100; j++) { // Read up to 100 chars
             const charCode = dataView.getUint8(strOffset + j);
             if (charCode === 0) break; // Null terminator
             str += String.fromCharCode(charCode);
           }
           return str;
        }
      }
    }
  } catch (e) {
    // Parsing error, ignore
    return null;
  }
  return null;
}
