import('./index.js').then(module => {
    (window as any).api = module;
});
