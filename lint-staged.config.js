module.exports = {
    '**/*.{ts,js}': [
        () => 'npm run checkTypes',
        () => 'npm run find-deadcode:dev',
        () => 'npm run eslint:fix',
        () => 'npm run prettier:fix',
    ]
};
