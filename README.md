# buffer-js-static-assets

[![Build Status](https://travis-ci.org/bufferapp/buffer-js-static-assets.svg?branch=master)](https://travis-ci.org/bufferapp/buffer-js-static-assets)

## Installation

Install the package

```
npm install @bufferapp/static-assets
```

## Usage

To utilize the `staticURL` function, you'll need to first initialize the
static assets manager:

```js
const { initStaticAssets } = require('@bufferapp/static-assets')

initStaticAssets()
  .then(() => {
    // Now that we have loaded the static assets we can serve requests
    app.listen(8080, () => console.log('Server started!'))
  })
```

Alternatively, you can call the `initStaticAssetsSync` function to perform
a synchronous load of the static assets file which is blocking:

```js
initStaticAssetsSync()
app.listen(8080, () => console.log('Server started!'))
```

Once the library is initialized, using the exported `staticUrl` function:

```js
const { staticUrl } = require('@bufferapp/static-assets')

app.get('/sweet', (req, res) => {
  res.render('sweet-template', {
    headerImage: staticUrl('img/sweet-header4.png'),
    script: staticUrl('js/sweet-bundle.js'),
  })
})
```

### Options

We have a few configuration options that can be passed to `initStaticAssets` in
a single object argument (ex. `initStaticAssets({ path: '/static' })`):

* `filename` (default: `staticAssets.json`) - The name of the static asset manifest file.
* `useLocal` (defaults to true when `NODE_ENV` is `development`, false otherwise) - Forces the use of the locally served static asset instead of the URL in the manifest.
* `path` (default: `/`) - The relative path where static assets are served during local dev. Usually via express-static.
* `localPort` - Specifies a different port to serve static assets from locally. Useful when running Webpack dev server on a port separate from your application.
* `dir` (default: `public`) - This is the directory relative to your working directory where your static assets are saved. This is used to look up static files in the manifest (See manifest section below).

### Static Asset Manifest

The format of the static asset manifest should be the same as default JSON
format that [`buffer-static-upload`](https://github.com/bufferapp/buffer-static-upload)
outputs.

This format is a key-value pair of:

```json
"relative path to local file from working directory": "remote URL for that file"
```

Here's an example:

```json
{
  "public/css/style.css": "https://static.buffer.com/my-app/public/css/style.1234567890.css",
  "public/img/brand.png": "https://static.buffer.com/my-app/public/img/brand.png"
}
```

## License

MIT
