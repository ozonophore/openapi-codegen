// import { expect, test } from './helps/fixtures';

// const testCases = [{ folder: 'v2/fetch' }];

// test.describe.parallel('API Tests', () => {
//     for (const { folder } of testCases) {
//         test.describe(`Folder: ${folder}`, () => {
//             test.use({ folder });

//             test('Check token flow', async ({ apiPage }) => {
//                 await apiPage.exposeFunction('tokenRequest', () => 'MY_TOKEN');

//                 const result = await apiPage.evaluate(async () => {
//                     try {
//                         const token = await (window as any).tokenRequest();
//                         const { SimpleService } = (window as any).api;
//                         // OpenAPI.TOKEN = token;
//                         // console.log({ OpenAPI, SimpleService });
//                         // return await SimpleService.getCallWithoutParametersAndResponse();

//                         return {
//                             token,
//                             response: await SimpleService.getCallWithoutParametersAndResponse(),
//                         };
//                     } catch (error) {
//                         console.error('Error in evaluate:', error);
//                         return { error: error.message };
//                     }
//                 });

//                 expect(result).toMatchObject({
//                     token: 'MY_TOKEN',
//                     // response: expect.objectContaining({
//                     //     status: 200,
//                     // }),
//                 });
//                 // expect(result).toBe('Bearer MY_TOKEN');
//             });

//             test.skip('Check complex types', async ({ apiPage }) => {
//                 const response = await apiPage.evaluate(async () => {
//                     const { SimpleService } = (window as any).api;
//                     return await SimpleService.complexTypes({
//                         id: 1,
//                         data: {
//                             name: 'Test',
//                             nested: { values: [1, 2, 3] },
//                         },
//                     });
//                 });

//                 expect(response).toEqual(
//                     expect.objectContaining({
//                         status: 200,
//                         data: expect.objectContaining({
//                             processed: true,
//                         }),
//                     })
//                 );
//             });
//         });
//     }
// });
