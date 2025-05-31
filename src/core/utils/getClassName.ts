import camelCase from 'camelcase';

/**
 * Convert the input value to a correct classname.
 * This converts the input string to camelCase, so the method name follows
 * the most popular Javascript and Typescript writing style.
 */
export function getClassName(value: string): string {
    const clean = value
        .replace(/^[^a-zA-Z]+/g, '')
        .replace(/[^\w\-]+/g, '-')
        .trim();
    return camelCase(clean).replace(/^./, match => match.toUpperCase());
}
