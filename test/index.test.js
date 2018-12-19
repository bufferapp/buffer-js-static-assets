const mock = require('mock-fs');
const MockDate = require('mockdate');
const {
  getStaticAssetsManager,
  initializeStaticAssetsManager,
} = require('../src');

const staticAssetVersionsFilename = 'staticAssets.json';
const filename = 'css/test.css';
const cdnUrl = 'https://cdn.com/css/test.12345.css';

describe('StaticAssetsManager', () => {
  beforeEach(() => {
    // Creates an in-memory file system
    mock({
      [staticAssetVersionsFilename]: JSON.stringify({ [`/public/${filename}`]: cdnUrl }),
    });
  });

  afterEach(() => {
    mock.restore();
  });

  describe('initializeStaticAssetsManager', () => {
    test('should initialize a StaticAssetsManager for production', async () => {
      await initializeStaticAssetsManager({ staticAssetVersionsFilename });
      expect(getStaticAssetsManager().getStaticUrl({ filename })).toBe(cdnUrl);
    });

    test('should initialize a StaticAssetsManager and trigger an error', async () => {
      try {
        await initializeStaticAssetsManager({ staticAssetVersionsFilename: 'unknown-file.json' });
      } catch (err) {
        expect(err.message).toBe("ENOENT, no such file or directory 'unknown-file.json'");
      }
    });
  });

  describe('getStaticUrl', () => {
    beforeEach(() => {
      initializeStaticAssetsManager({});
    });

    test('should return a correct css cdn url', () => {
      const staticAssetVersions = {
        [`/public/${filename}`]: cdnUrl,
      };
      getStaticAssetsManager().setStaticAssetVersions({ staticAssetVersions });

      expect(getStaticAssetsManager().getStaticUrl({ filename })).toBe(cdnUrl);
    });

    test('should have asset version but return local url', () => {
      const staticAssetVersions = {};
      getStaticAssetsManager().setStaticAssetVersions({ staticAssetVersions });

      expect(getStaticAssetsManager().getStaticUrl({ filename })).toBe('/public/css/test.css');
    });

    test('should return local url', () => {
      expect(getStaticAssetsManager().getStaticUrl({ filename })).toBe('/public/css/test.css');
    });

    test('should return local url with date appended', () => {
      MockDate.set('1/1/2019');
      expect(getStaticAssetsManager().getStaticUrl({ filename, shouldAppendCacheBust: true }))
        .toBe(`/public/css/test.css?v=${new Date().valueOf()}`);
      MockDate.reset();
    });
  });
});
