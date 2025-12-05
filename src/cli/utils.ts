import figlet from "figlet";

export function isValidJson(value: any) {
    try {
        JSON.parse(value);
        return true;
    } catch {
        return false;
    }
}

/**
 * Returns the stylized package name to display in the terminal
 * @param appName Package name
 */
export function getCLIName(appName: string) {
    const name = figlet.textSync(appName, {
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 75,
        whitespaceBreak: true,
    });

    return `
    
    ${name}
    
    `;
}
