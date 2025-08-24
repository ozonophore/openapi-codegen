/**
 * Advanced path deduplication - remove consecutive duplicate segments
 */
export function advancedDeduplicatePath(path: string): string {
    const segments = path.split('/');
    const result: string[] = [];
    
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        
        if (segment === '' || segment === '.') {
            continue;
        }
        if (segment === '..') {
            if (result.length > 0) {
                result.pop();
            }
            continue;
        }
        
        // Check if this segment is a duplicate of the previous one
        if (result.length > 0 && result[result.length - 1] === segment) {
            // Skip duplicate segment
            continue;
        }
        
        result.push(segment);
    }
    
    return result.length > 0 ? '/' + result.join('/') : '';
}