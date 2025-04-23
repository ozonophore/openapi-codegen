import { expect, test } from './helps/fixtures';

const testCases = [{ folder: 'v2/fetch' }, { folder: 'v2/node' }, { folder: 'v2/axios' }, { folder: 'v2/babel' }];

test.describe.parallel('API Tests', () => {
    for (const { folder } of testCases) {
        test.describe(`Folder: ${folder}`, () => {
            test.use({ folder });

            test('Check token flow', async ({ apiPage }) => {
                await apiPage.exposeFunction('tokenRequest', () => 'MOCK_TOKEN_123');

                const result = await apiPage.evaluate(async () => {
                    try {
                        const token = await (window as any).tokenRequest();
                        const { SimpleService } = (window as any).api;
                        return {
                            token,
                            response: await SimpleService.getWithToken(token),
                        };
                    } catch (error) {
                        return { error: error.message };
                    }
                });

                expect(result).toMatchObject({
                    token: 'MOCK_TOKEN_123',
                    response: expect.objectContaining({
                        status: 200,
                    }),
                });
            });

            test('Check complex types', async ({ apiPage }) => {
                const response = await apiPage.evaluate(async () => {
                    const { SimpleService } = (window as any).api;
                    return await SimpleService.complexTypes({
                        id: 1,
                        data: {
                            name: 'Test',
                            nested: { values: [1, 2, 3] },
                        },
                    });
                });

                expect(response).toEqual(
                    expect.objectContaining({
                        status: 200,
                        data: expect.objectContaining({
                            processed: true,
                        }),
                    })
                );
            });
        });
    }
});
