import('./index').then(module => {
    (window as any).api = module;
});
