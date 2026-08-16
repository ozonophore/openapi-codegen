export type IgnoreMatchEntry = {
    path: string;
};

export type IgnoreRule = {
    path?: string;
    pattern?: string;
    reason?: string;
    until?: string;
};
