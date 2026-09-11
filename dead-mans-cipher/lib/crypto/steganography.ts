/**
 * Dead Man's Cipher — Steganography Engine
 * LSB Image Steganography + Zero-Width Unicode Shanty Text Steganography
 */

const ZERO_WIDTH_ZERO = "\u200B"; // 0
const ZERO_WIDTH_ONE = "\u200C";  // 1
const ZERO_WIDTH_DELIM = "\u200D"; // Delimiter

export interface StegoResultText {
  stegoText: string;
  originalText: string;
  payloadLengthBits: number;
  carrierWordsUsed: number;
}

/**
 * Hide secret payload string inside Sea Shanty text using Zero-Width Unicode characters
 */
export function embedPayloadInShantyText(
  shantyLyrics: string,
  payload: string
): StegoResultText {
  // Convert payload to binary string
  const enc = new TextEncoder();
  const bytes = enc.encode(payload);
  let binaryStr = "";
  for (let i = 0; i < bytes.length; i++) {
    binaryStr += bytes[i].toString(2).padStart(8, "0");
  }

  // Convert binary to zero-width characters
  let zwSequence = "";
  for (let i = 0; i < binaryStr.length; i++) {
    zwSequence += binaryStr[i] === "0" ? ZERO_WIDTH_ZERO : ZERO_WIDTH_ONE;
  }
  zwSequence += ZERO_WIDTH_DELIM; // End marker

  // Embed zero-width sequence after the first line or first word of shanty
  const lines = shantyLyrics.split("\n");
  if (lines.length > 1) {
    lines[0] = lines[0] + zwSequence;
  } else {
    lines[0] = lines[0] + zwSequence;
  }

  return {
    stegoText: lines.join("\n"),
    originalText: shantyLyrics,
    payloadLengthBits: binaryStr.length,
    carrierWordsUsed: shantyLyrics.split(/\s+/).length,
  };
}

/**
 * Extract secret payload string from Sea Shanty text containing Zero-Width Unicode characters
 */
export function extractPayloadFromShantyText(stegoText: string): string | null {
  let binaryStr = "";

  for (let i = 0; i < stegoText.length; i++) {
    const char = stegoText[i];
    if (char === ZERO_WIDTH_ZERO) {
      binaryStr += "0";
    } else if (char === ZERO_WIDTH_ONE) {
      binaryStr += "1";
    } else if (char === ZERO_WIDTH_DELIM) {
      break; // End of payload marker reached
    }
  }

  if (binaryStr.length === 0 || binaryStr.length % 8 !== 0) {
    return null;
  }

  const bytes = new Uint8Array(binaryStr.length / 8);
  for (let i = 0; i < binaryStr.length; i += 8) {
    const byteStr = binaryStr.substring(i, i + 8);
    bytes[i / 8] = parseInt(byteStr, 2);
  }

  try {
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Calculate LSB image payload capacity in bytes given canvas width & height
 */
export function calculateImageCapacity(width: number, height: number): {
  totalPixels: number;
  usableBits: number;
  usableBytes: number;
} {
  const totalPixels = width * height;
  const usableBits = totalPixels * 3; // 1 bit per RGB channel (Alpha excluded)
  const usableBytes = Math.floor(usableBits / 8);
  return { totalPixels, usableBits, usableBytes };
}

/**
 * Embed payload into Canvas ImageData using LSB (Least Significant Bit)
 */
export function embedPayloadImageData(
  imageData: ImageData,
  payload: string
): ImageData {
  const enc = new TextEncoder();
  const payloadBytes = enc.encode(payload);
  const data = imageData.data;

  // Header: 32-bit integer length prefix
  const len = payloadBytes.length;
  const fullBytes = new Uint8Array(4 + len);
  fullBytes[0] = (len >> 24) & 0xff;
  fullBytes[1] = (len >> 16) & 0xff;
  fullBytes[2] = (len >> 8) & 0xff;
  fullBytes[3] = len & 0xff;
  fullBytes.set(payloadBytes, 4);

  // Convert full bytes to bit array
  const bits: number[] = [];
  for (let i = 0; i < fullBytes.length; i++) {
    for (let bit = 7; bit >= 0; bit--) {
      bits.push((fullBytes[i] >> bit) & 1);
    }
  }

  if (bits.length > (imageData.width * imageData.height * 3)) {
    throw new Error("Payload too large for carrier image capacity.");
  }

  let bitIdx = 0;
  for (let i = 0; i < data.length && bitIdx < bits.length; i++) {
    if ((i + 1) % 4 === 0) continue; // Skip Alpha channel
    data[i] = (data[i] & 0xfe) | bits[bitIdx];
    bitIdx++;
  }

  return imageData;
}

/**
 * Extract payload from Canvas ImageData using LSB (Least Significant Bit)
 */
export function extractPayloadImageData(imageData: ImageData): string | null {
  const data = imageData.data;
  const bits: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if ((i + 1) % 4 === 0) continue; // Skip Alpha
    bits.push(data[i] & 1);
  }

  if (bits.length < 32) return null;

  // Reconstruct length prefix (first 32 bits = 4 bytes)
  let len = 0;
  for (let i = 0; i < 32; i++) {
    len = ((len << 1) | bits[i]) >>> 0;
  }

  if (len <= 0 || len > (bits.length - 32) / 8) return null;

  const payloadBytes = new Uint8Array(len);
  let bitIdx = 32;
  for (let byteIdx = 0; byteIdx < len; byteIdx++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bits[bitIdx++];
    }
    payloadBytes[byteIdx] = byteVal;
  }

  try {
    return new TextDecoder().decode(payloadBytes);
  } catch {
    return null;
  }
}
