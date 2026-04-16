export function getOperationResponseCode(value: string | 'default'): number | null {
    // "default" is not an explicit HTTP status code and should not be coerced.
    if (value === 'default') {
        return null;
    }

    const normalizedValue = value.trim();

    // OpenAPI supports exact response codes (e.g. "200")
    if (/^\d{3}$/.test(normalizedValue)) {
        return Number(normalizedValue);
    }

    // OpenAPI supports response code ranges (e.g. "2XX")
    if (/^[1-5]XX$/i.test(normalizedValue)) {
        return Number(normalizedValue[0]) * 100;
    }

    return null;
}
