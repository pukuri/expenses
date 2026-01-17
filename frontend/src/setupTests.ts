import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder (needed for testing environment)
if (typeof globalThis.TextEncoder === 'undefined') {
  (globalThis as any).TextEncoder = class {
    encoding = 'utf-8';
    encode(input = '') {
      const encoded = new Uint8Array(input.length);
      for (let i = 0; i < input.length; i++) {
        encoded[i] = input.charCodeAt(i);
      }
      return encoded;
    }
    encodeInto() {
      return { read: 0, written: 0 };
    }
  };
  
  (globalThis as any).TextDecoder = class {
    encoding = 'utf-8';
    fatal = false;
    ignoreBOM = false;
    decode(input?: Uint8Array) {
      if (!input) return '';
      return String.fromCharCode(...input);
    }
  };
}

// Mock window.matchMedia (commonly needed for UI components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
