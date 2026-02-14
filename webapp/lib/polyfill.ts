import { Buffer } from 'buffer';

// @ts-ignore
if (typeof window !== 'undefined') {
    // @ts-ignore
    window.Buffer = window.Buffer || Buffer;
}

// @ts-ignore
if (typeof global !== 'undefined') {
    // @ts-ignore
    global.Buffer = global.Buffer || Buffer;
}

// @ts-ignore
if (typeof globalThis !== 'undefined') {
    // @ts-ignore
    globalThis.Buffer = globalThis.Buffer || Buffer;
}

// Patch Uint8Array to support buffer methods used by the SDK
// @ts-ignore
if (typeof Uint8Array !== 'undefined' && !Uint8Array.prototype.readUint32LE) {
    // @ts-ignore
    Uint8Array.prototype.readUint32LE = function (offset: number = 0) {
        return Buffer.from(this).readUint32LE(offset);
    };
}

const hasBigInt = typeof BigInt !== 'undefined';
const hasDataView = typeof DataView !== 'undefined';
const hasDataViewGetBigInt64 =
    hasDataView && typeof DataView.prototype.getBigInt64 === 'function';
const hasDataViewGetBigUint64 =
    hasDataView && typeof DataView.prototype.getBigUint64 === 'function';

function readBigInt64LEFromBytes(bytes: Uint8Array, offset: number = 0) {
    if (!hasBigInt) {
        throw new Error('BigInt is not available in this environment');
    }

    if (hasDataViewGetBigInt64) {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        return view.getBigInt64(offset, true);
    }

    const lo =
        (bytes[offset] |
            (bytes[offset + 1] << 8) |
            (bytes[offset + 2] << 16) |
            (bytes[offset + 3] << 24)) >>> 0;
    const hi =
        (bytes[offset + 4] |
            (bytes[offset + 5] << 8) |
            (bytes[offset + 6] << 16) |
            (bytes[offset + 7] << 24)) | 0;

    return (BigInt(hi) << 32n) + BigInt(lo);
}

function readBigUInt64LEFromBytes(bytes: Uint8Array, offset: number = 0) {
    if (!hasBigInt) {
        throw new Error('BigInt is not available in this environment');
    }

    if (hasDataViewGetBigUint64) {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        return view.getBigUint64(offset, true);
    }

    const lo =
        (bytes[offset] |
            (bytes[offset + 1] << 8) |
            (bytes[offset + 2] << 16) |
            (bytes[offset + 3] << 24)) >>> 0;
    const hi =
        (bytes[offset + 4] |
            (bytes[offset + 5] << 8) |
            (bytes[offset + 6] << 16) |
            (bytes[offset + 7] << 24)) >>> 0;

    return (BigInt(hi) << 32n) + BigInt(lo);
}

// Patch Uint8Array to support 64-bit reads used by the SDK
// @ts-ignore
if (typeof Uint8Array !== 'undefined' && !Uint8Array.prototype.readBigInt64LE) {
    // @ts-ignore
    Uint8Array.prototype.readBigInt64LE = function (offset: number = 0) {
        return readBigInt64LEFromBytes(this, offset);
    };
}

// @ts-ignore
if (typeof Uint8Array !== 'undefined' && !Uint8Array.prototype.readBigUInt64LE) {
    // @ts-ignore
    Uint8Array.prototype.readBigUInt64LE = function (offset: number = 0) {
        return readBigUInt64LEFromBytes(this, offset);
    };
}

// Patch Buffer in case the browser polyfill is missing BigInt helpers
// @ts-ignore
if (typeof Buffer !== 'undefined' && !Buffer.prototype.readBigInt64LE) {
    // @ts-ignore
    Buffer.prototype.readBigInt64LE = function (offset: number = 0) {
        return readBigInt64LEFromBytes(this, offset);
    };
}

// @ts-ignore
if (typeof Buffer !== 'undefined' && !Buffer.prototype.readBigUInt64LE) {
    // @ts-ignore
    Buffer.prototype.readBigUInt64LE = function (offset: number = 0) {
        return readBigUInt64LEFromBytes(this, offset);
    };
}
