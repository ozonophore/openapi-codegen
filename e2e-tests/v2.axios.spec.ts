// import { expect, test } from './helps/fixtures';

// test.describe('v2.axios', () => {
//     test.use({ folder: 'v2/axios' });

//     test('requests token', async ({ apiPage }) => {
//         await apiPage.exposeFunction('tokenRequest', () => 'MY_TOKEN');
//         const result = await apiPage.evaluate(async () => {
//             try {
//                 const token = await (window as any).tokenRequest();
//                 const { OpenAPI, SimpleService } = (window as any).api;
//                 OpenAPI.TOKEN = token;

//                 return SimpleService.getCallWithoutParametersAndResponse();
//             } catch (error) {
//                 return { error: error.message };
//             }
//         });
//         expect(result).toMatchObject({
//             token: 'MOCK_TOKEN_123',
//             response: expect.objectContaining({
//                 status: 200,
//             }),
//         });
//     });

//     test('complexService', async ({ apiPage }) => {
//         const response = await apiPage.evaluate(async () => {
//             try {
//                 const { ComplexService } = (window as any).api;
//                 return await ComplexService.complexTypes({
//                     first: {
//                         second: {
//                             third: 'Hello World!',
//                         },
//                     },
//                 });
//             } catch (error) {
//                 return { error: error.message };
//             }
//         });
//         expect(response).toBeDefined();
//     });
// });
