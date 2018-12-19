const mock = require('mock-fs');
const MockDate = require('mockdate');
const {
  staticUrl,
  initializeStaticAssetsManager,
} = require('../src');

const staticAssetVersionsFilename = 'staticAssets.json';
const staticAssetVersionsFilename2 = 'staticAssets2.json';
const filename = 'css/test.css';
const cdnUrl = 'https://cdn.com/css/test.12345.css';

beforeAll(() => {
  // Creates an in-memory file system
  mock({
    [staticAssetVersionsFilename]: JSON.stringify({ [`/public/${filename}`]: cdnUrl }),
    [staticAssetVersionsFilename2]: JSON.stringify({ }),
  });
});

afterAll(() => {
  mock.restore();
});

test('should return a correct css cdn url', async () => {
  await initializeStaticAssetsManager({ staticAssetVersionsFilename });
  expect(staticUrl(filename)).toBe(cdnUrl);
});

test('should return local url', async () => {
  await initializeStaticAssetsManager({
    staticAssetVersionsFilename: staticAssetVersionsFilename2,
  });

  expect(staticUrl(filename)).toBe('/public/css/test.css');
});

test('should initialize a StaticAssetsManager and trigger an error', async () => {
  try {
    await initializeStaticAssetsManager({ staticAssetVersionsFilename: 'unknown-file.json' });
  } catch (err) {
    expect(err.message).toBe("ENOENT, no such file or directory 'unknown-file.json'");
  }
});

test('should return local url', async () => {
  await initializeStaticAssetsManager({ });
  expect(staticUrl(filename)).toBe('/public/css/test.css');
});

test('should return local url with date appended', async () => {
  await initializeStaticAssetsManager({ });

  MockDate.set('1/1/2019');
  expect(staticUrl(filename, true))
    .toBe(`/public/css/test.css?v=${new Date().valueOf()}`);
  MockDate.reset();
});
