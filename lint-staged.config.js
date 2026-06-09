module.exports = {
    '**/*.{ts,js}': [
        () => 'npm run checkTypes',
        () => 'npm run eslint:fix',
        () => 'npm run prettier:fix',
    ]
};
