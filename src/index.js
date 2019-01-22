const fs = require('fs');
const { join } = require('path');

class StaticAssetsManager {
  constructor({
    staticAssetVersions = {},
    useStaticAssetVersions = false,
    staticAssetDirLocal = '/public',
    staticAssetDirCDN = '/public',
  }) {
    this.staticAssetVersions = staticAssetVersions;
    this.useStaticAssetVersions = useStaticAssetVersions;
    this.staticAssetDirLocal = staticAssetDirLocal;
    this.staticAssetDirCDN = staticAssetDirCDN;
  }

  getStaticUrl({ filename, shouldAppendCacheBust = false }) {
    const filepath = this.getFilepath({ filename });
    if (this.useStaticAssetVersions) {
      const cdnUrl = this.staticAssetVersions[filepath];
      if (cdnUrl) {
        return cdnUrl;
      }
    }
    const localUrl = this.getFilepath({ filename, forceLocal: true });
    return shouldAppendCacheBust
      ? `${localUrl}?v=${new Date().valueOf()}`
      : localUrl;
  }

  setStaticAssetVersions({ staticAssetVersions }) {
    this.staticAssetVersions = staticAssetVersions;
    this.useStaticAssetVersions = true;
  }

  getFilepath({ filename, forceLocal = false }) {
    return this.useStaticAssetVersions && !forceLocal
      ? join(this.staticAssetDirCDN, filename)
      : join(this.staticAssetDirLocal, filename);
  }
}

let staticAssetsManager;
const initializeStaticAssetsManager = ({
  staticAssetVersionsFilename,
  staticAssetDirLocal,
  staticAssetDirCDN,
}) => {
  staticAssetsManager = new StaticAssetsManager({ staticAssetDirLocal, staticAssetDirCDN });
  return new Promise((resolve, reject) => {
    if (!staticAssetVersionsFilename) {
      return resolve();
    }

    return fs.readFile(staticAssetVersionsFilename, 'utf8', (err, contents) => {
      if (err) {
        return reject(err);
      }
      staticAssetsManager.setStaticAssetVersions({ staticAssetVersions: JSON.parse(contents) });
      return resolve();
    });
  });
};

const initializeStaticAssetsManagerSync = ({
  staticAssetVersionsFilename,
  staticAssetDirLocal,
  staticAssetDirCDN,
}) => {
  staticAssetsManager = new StaticAssetsManager({ staticAssetDirLocal, staticAssetDirCDN });

  if (!staticAssetVersionsFilename) {
    /* eslint-disable no-console */
    console.warn('WARNING: staticAssetVersionsFilename not specified. This should be set in production');
    /* eslint-enable no-console */
    return false;
  }

  const contents = fs.readFileSync(staticAssetVersionsFilename, 'utf8');
  const staticAssetVersions = JSON.parse(contents);
  staticAssetsManager.setStaticAssetVersions({ staticAssetVersions });
  return true;
};

const staticUrl = (filename, shouldAppendCacheBust) => staticAssetsManager.getStaticUrl({
  filename,
  shouldAppendCacheBust,
});

module.exports = {
  initializeStaticAssetsManager,
  initializeStaticAssetsManagerSync,
  staticUrl,
};
