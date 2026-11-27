 /**
 * ASTC Texture Decoder
 * 
 * Professional-grade ASTC (Adaptive Scalable Texture Compression) decoder
 * with automatic header parsing and WebAssembly acceleration.
 * 
 * @author Github.com/0xMe
 */

// ============================================================================
// WebAssembly Import Object
// ============================================================================

/** @type {Object} WebAssembly imports required by the module */
const wasmImports = {
    env: {
        /**
         * Memory allocation error handler
         * @param {number} size - Requested allocation size
         * @param {number} align - Requested alignment
         */
        __wbindgen_throw: (size, align) => {
            throw new Error(`Memory allocation failed: size=${size}, align=${align}`);
        }
    }
};

// ============================================================================
// Memory Management Utilities
// ============================================================================

/** @type {Uint8Array|null} Cached reference to WebAssembly memory for Uint8 operations */
let cachedUint8Memory0 = null;

/**
 * Retrieves cached Uint8Array view of WebAssembly memory buffer
 * @returns {Uint8Array} View into WebAssembly memory
 */
function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

/** @type {Int32Array|null} Cached reference to WebAssembly memory for Int32 operations */
let cachedInt32Memory0 = null;

/**
 * Retrieves cached Int32Array view of WebAssembly memory buffer
 * @returns {Int32Array} View into WebAssembly memory
 */
function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

/** @type {number} Tracks vector length for WASM memory operations */
let WASM_VECTOR_LEN = 0;

// ============================================================================
// Data Transfer Utilities (JavaScript ↔ WebAssembly)
// ============================================================================

/**
 * Transfers Uint8Array from JavaScript to WebAssembly memory
 * @param {Uint8Array} arg - Data to transfer
 * @param {Function} malloc - WebAssembly memory allocator function
 * @returns {number} Pointer to allocated memory in WebAssembly
 */
function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

/**
 * Extracts Uint8Array from WebAssembly memory
 * @param {number} ptr - Pointer to memory location
 * @param {number} len - Length of data to extract
 * @returns {Uint8Array} Extracted data
 */
function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

// ============================================================================
// ASTC Header Parser
// ============================================================================

/**
 * ASTC Header Structure
 * 
 * Byte 0-3: Magic Number (0x13, 0xAB, 0xA1, 0x5C)
 * Byte 4:   Block Width
 * Byte 5:   Block Height  
 * Byte 6:   Block Depth
 * Byte 7-9: Image Width (24-bit little endian)
 * Byte 10-12: Image Height (24-bit little endian)
 * Byte 13-15: Image Depth (24-bit little endian)
 */

/**
 * Parses ASTC file header to extract metadata
 * @param {Uint8Array} data - Raw ASTC file data including header
 * @returns {Object} Parsed header information
 * @throws {Error} If header is invalid or malformed
 */
function parseASTCHeader(data) {
    // Validate minimum header length
    const MIN_HEADER_LENGTH = 16;
    if (data.length < MIN_HEADER_LENGTH) {
        throw new Error(`Invalid ASTC file: Header requires ${MIN_HEADER_LENGTH} bytes, got ${data.length}`);
    }
    
    // Validate magic number (ASTC file signature)
    const EXPECTED_MAGIC = [0x13, 0xAB, 0xA1, 0x5C];
    const isValidMagic = EXPECTED_MAGIC.every((byte, index) => data[index] === byte);
    
    if (!isValidMagic) {
        throw new Error('Invalid ASTC magic number. File may be corrupted or not ASTC format');
    }
    
    // Extract block dimensions (bytes 4-6)
    const blockWidth = data[4];
    const blockHeight = data[5]; 
    const blockDepth = data[6];
    
    // Extract image dimensions (bytes 7-15, 24-bit little endian)
    const width = data[7] | (data[8] << 8) | (data[9] << 16);
    const height = data[10] | (data[11] << 8) | (data[12] << 16);
    const depth = data[13] | (data[14] << 8) | (data[15] << 16);
    
    // Validate extracted dimensions
    if (width === 0 || height === 0) {
        throw new Error('Invalid image dimensions in ASTC header');
    }
    
    if (blockWidth === 0 || blockHeight === 0) {
        throw new Error('Invalid block dimensions in ASTC header');
    }
    
    return {
        blockSize: `${blockWidth}x${blockHeight}`,
        blockWidth,
        blockHeight, 
        blockDepth,
        dimensions: `${width}x${height}`,
        width,
        height,
        depth,
        isValid: true,
        headerSize: MIN_HEADER_LENGTH
    };
}

// ============================================================================
// Main Decoder Function
// ============================================================================

/**
 * Decodes ASTC compressed texture data to RGBA pixels
 * @param {Uint8Array} astcData - Complete ASTC file data including header
 * @returns {Uint8Array} Decoded RGBA image data (width * height * 4 bytes)
 * @throws {Error} If decoding fails or WASM module not initialized
 */
function decodeASTCTexture(astcData) {
    // Validate WebAssembly module initialization
    if (!wasm) {
        throw new Error('WebAssembly module not initialized. Call initASTCDecoder() first');
    }
    
    // Parse header to extract metadata
    const header = parseASTCHeader(astcData);
    
    // Extract compressed data (exclude header)
    const compressedData = astcData.subarray(header.headerSize);
    
    // Validate compressed data exists
    if (compressedData.length === 0) {
        throw new Error('No compressed data found after ASTC header');
    }
    
    try {
        // Allocate stack space for return values
        const returnPointer = wasm.__wbindgen_add_to_stack_pointer(-16);
        
        // Transfer compressed data to WebAssembly memory
        const dataPointer = passArray8ToWasm0(
            compressedData, 
            wasm.__wbindgen_malloc
        );
        
        // Execute WebAssembly decoding
        wasm.astcDecode(
            returnPointer,
            dataPointer,
            WASM_VECTOR_LEN,
            header.width,
            header.height, 
            header.blockWidth,
            header.blockHeight
        );
        
        // Retrieve results from WebAssembly memory
        const resultPointer = getInt32Memory0()[returnPointer / 4 + 0];
        const resultLength = getInt32Memory0()[returnPointer / 4 + 1];
        
        // Extract decoded image data
        const decodedImage = getArrayU8FromWasm0(resultPointer, resultLength).slice();
        
        // Free WebAssembly memory
        wasm.__wbindgen_free(resultPointer, resultLength * 1);
        
        // Validate the decoded data size matches expected dimensions
        const expectedSize = header.width * header.height * 4;
        if (decodedImage.length !== expectedSize) {
            console.warn(`Decoded data size mismatch: expected ${expectedSize} bytes, got ${decodedImage.length} bytes`);
            
            // Handle size mismatch by creating properly sized buffer
            const properSizedData = new Uint8Array(expectedSize);
            const copyLength = Math.min(decodedImage.length, expectedSize);
            properSizedData.set(decodedImage.subarray(0, copyLength), 0);
            
            return properSizedData;
        }
        
        return decodedImage;
        
    } finally {
        // Clean up stack allocation
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

// ============================================================================
// WebAssembly Initialization
// ============================================================================

/** @type {Object|null} WebAssembly module exports */
let wasm = null;

/**
 * Initializes the WebAssembly ASTC decoder module
 * @param {string} wasmPath - Path to WASM file (default: 'astc_decode_bg.wasm')
 * @returns {Promise<boolean>} Success status
 */
async function initASTCDecoder(wasmPath = 'assets/vendor/astc_decode_bg.wasm') {
    try {
        // Fetch and compile WebAssembly module
        const response = await fetch(wasmPath);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch WASM file: ${response.status} ${response.statusText}`);
        }
        
        const wasmBytes = await response.arrayBuffer();
        
        if (wasmBytes.byteLength === 0) {
            throw new Error('WASM file is empty');
        }
        
        const wasmModule = await WebAssembly.compile(wasmBytes);
        
        // Instantiate with imports
        const wasmInstance = await WebAssembly.instantiate(wasmModule, wasmImports);
        wasm = wasmInstance.exports;
        
        //console.log('✅ ASTC WebAssembly decoder initialized successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Failed to initialize ASTC decoder:', error);
        throw new Error(`ASTC decoder initialization failed: ${error.message}`);
    }
}

// ============================================================================
// Canvas Utility Functions
// ============================================================================

/**
 * Creates ImageData from decoded ASTC data with proper size validation
 * @param {Uint8Array} decodedData - Decoded RGBA data
 * @param {number} width - Expected image width
 * @param {number} height - Expected image height
 * @returns {ImageData} Valid ImageData object
 */
function createValidImageData(decodedData, width, height) {
    const expectedSize = width * height * 4;
    
    if (decodedData.length !== expectedSize) {
        console.warn(`ImageData size correction: ${decodedData.length} → ${expectedSize} bytes`);
        
        // Create properly sized buffer
        const properData = new Uint8ClampedArray(expectedSize);
        const copyLength = Math.min(decodedData.length, expectedSize);
        
        // Copy available data
        for (let i = 0; i < copyLength; i++) {
            properData[i] = decodedData[i];
        }
        
        // Fill remaining with transparent black if needed
        for (let i = copyLength; i < expectedSize; i++) {
            properData[i] = i % 4 === 3 ? 255 : 0; // Alpha = 255, RGB = 0
        }
        
        return new ImageData(properData, width, height);
    }
    
    return new ImageData(new Uint8ClampedArray(decodedData), width, height);
}

/**
 * Draws decoded ASTC data to canvas with error handling
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Uint8Array} decodedData - Decoded image data
 * @param {number} width - Image width
 * @param {number} height - Image height
 */
function drawToCanvas(ctx, decodedData, width, height) {
    try {
        const imageData = createValidImageData(decodedData, width, height);
        ctx.putImageData(imageData, 0, 0);
        return true;
    } catch (error) {
        console.error('Failed to draw to canvas:', error);
        return false;
    }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Main ASTC decoder class providing clean API surface
 */
class ASTCDecoder {
    /**
     * Creates a new ASTC decoder instance
     * @param {string} wasmPath - Optional custom path to WASM file
     */
    constructor(wasmPath) {
        this.wasmPath = wasmPath;
        this.initialized = false;
    }
    
    /**
     * Initializes the decoder
     * @returns {Promise<void>}
     */
    async init() {
        if (this.wasmPath) {
            await initASTCDecoder(this.wasmPath);
        } else {
            await initASTCDecoder();
        }
        this.initialized = true;
    }
    
    /**
     * Decodes ASTC data to RGBA pixels
     * @param {Uint8Array} astcData - ASTC file data
     * @returns {Uint8Array} Decoded RGBA image
     */
    decode(astcData) {
        if (!this.initialized) {
            throw new Error('Decoder not initialized. Call init() first');
        }
        return decodeASTCTexture(astcData);
    }
    
    /**
     * Convenience method to decode from ArrayBuffer
     * @param {ArrayBuffer} arrayBuffer - ASTC file data as ArrayBuffer
     * @returns {Uint8Array} Decoded RGBA image
     */
    decodeFromArrayBuffer(arrayBuffer) {
        return this.decode(new Uint8Array(arrayBuffer));
    }
    
    /**
     * Convenience method to decode from Blob
     * @param {Blob} blob - ASTC file data as Blob
     * @returns {Promise<Uint8Array>} Decoded RGBA image
     */
    async decodeFromBlob(blob) {
        const arrayBuffer = await blob.arrayBuffer();
        return this.decodeFromArrayBuffer(arrayBuffer);
    }
    
    /**
     * Decodes and draws ASTC data directly to canvas
     * @param {Uint8Array} astcData - ASTC file data
     * @param {HTMLCanvasElement} canvas - Target canvas element
     * @returns {boolean} Success status
     */
    decodeAndDraw(astcData, canvas) {
        const decodedData = this.decode(astcData);
        const header = parseASTCHeader(astcData);
        const ctx = canvas.getContext('2d');
        
        canvas.width = header.width;
        canvas.height = header.height;
        
        return drawToCanvas(ctx, decodedData, header.width, header.height);
    }
}

// ============================================================================
// Global Export and Browser Compatibility
// ============================================================================

// Export for browser global usage
if (typeof window !== 'undefined') {
    window.ASTCDecoder = ASTCDecoder;
    window.decodeASTCTexture = decodeASTCTexture;
    window.initASTCDecoder = initASTCDecoder;
    window.parseASTCHeader = parseASTCHeader;
    window.createValidImageData = createValidImageData;
    window.drawToCanvas = drawToCanvas;
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ASTCDecoder,
        decodeASTCTexture,
        initASTCDecoder,
        parseASTCHeader,
        createValidImageData,
        drawToCanvas
    };
}

export { ASTCDecoder, decodeASTCTexture, initASTCDecoder, parseASTCHeader, drawToCanvas };

