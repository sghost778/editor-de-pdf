const typedArrayPrototype = Uint8Array.prototype as Uint8Array & { toHex?: () => string };

if (typeof typedArrayPrototype.toHex !== 'function') {
  Object.defineProperty(Uint8Array.prototype, 'toHex', {
    configurable: true,
    value(this: Uint8Array) {
      let hex = '';
      for (const byte of this) hex += byte.toString(16).padStart(2, '0');
      return hex;
    },
  });
}

type ComputedCache = {
  has: (key: any) => boolean;
  get: (key: any) => any;
  set: (key: any, value: any) => any;
};

function getOrInsertComputed(this: ComputedCache, key: any, callback: (key: any) => any) {
  if (this.has(key)) return this.get(key);
  const value = callback(key);
  this.set(key, value);
  return value;
}

for (const prototype of [Map.prototype, WeakMap.prototype]) {
  if (typeof (prototype as { getOrInsertComputed?: unknown }).getOrInsertComputed === 'function') continue;
  Object.defineProperty(prototype, 'getOrInsertComputed', {
    configurable: true,
    value: getOrInsertComputed,
  });
}