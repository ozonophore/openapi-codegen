export function safeHasOwn<T extends object>(obj: T, key: PropertyKey): key is keyof T {
    if (typeof Object.hasOwn === 'function') {
        return Object.hasOwn(obj, key);
    }
    return Object.prototype.hasOwnProperty.call(obj, key);
}
