/**
 * Вычисляет расстояние Левенштейна между двумя строками.
 */
function getLevenshteinDistance(a: string, b: string): number {
    const matrix = Array.from({ length: a.length + 1 }, () => 
        new Array(b.length + 1).fill(0)
    );

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // удаление
                matrix[i][j - 1] + 1,      // вставка
                matrix[i - 1][j - 1] + cost // замена
            );
        }
    }
    return matrix[a.length][b.length];
}

/**
 * Ищет наиболее подходящую замену из списка доступных опций.
 */
export function findBestMatch(
    target: string, 
    options: string[], 
    threshold = 3
): string | null {
    let bestMatch: string | null = null;
    let minDistance = Infinity;

    for (const option of options) {
        const distance = getLevenshteinDistance(target, option);
        if (distance < minDistance && distance <= threshold) {
            minDistance = distance;
            bestMatch = option;
        }
    }

    return bestMatch;
}
