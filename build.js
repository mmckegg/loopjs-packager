var fs = require('fs')
var execFileSync = require('child_process').execFileSync
var rimraf = require('rimraf')
var cpr = require('cpr')
var electronPackager = require('electron-packager')
var appdmg = require('appdmg')
var packageMsi = require('msi-packager')
var path = require('path')
var each = require('each-async')
var sign = require('electron-osx-sign')

var buildFrom = '/Users/matt/Code/loop-drop-app'
var appPackage = require(buildFrom + '/package.json')

var platform = process.argv[2]
var arch = process.argv[3]
if (platform === 'darwin' && !arch) {
  arch = 'x64'
}

process.cwd(__dirname)

rimraf.sync('build')

electronPackager({
  dir: buildFrom,
  out: 'build',
  name: 'Loop Drop',
  arch: arch,
  overwrite: true,
  platform: platform,
  version: '0.36.6',
  appVersion: appPackage.version,
  prune: true,
  derefSymlinks: true,
  asar: true,
  icon: 'icon.ext',
  ignore: [
    '/demo-project',
    'test/',
    'tests/',
    'sounds/',
    'doc/',
    'mocha/',
    'node_modules/midi/',
    'testling/',
    'web-fs/',
    'browserify-fs/'
  ]
}, copyDemoProject)

function copyDemoProject (err) {
  if (err) throw err
  var targets = []

  if (fs.existsSync('build/Loop Drop-darwin-x64')) {
    targets.push('build/Loop Drop-darwin-x64/Loop Drop.app/Contents/Resources/demo-project')
  }

  if (fs.existsSync('build/Loop Drop-win32-ia32')) {
    targets.push('build/Loop Drop-win32-ia32/demo-project')
  }

  if (fs.existsSync('build/Loop Drop-win32-x64')) {
    targets.push('build/Loop Drop-win32-x64/demo-project')
  }

  if (fs.existsSync('build/Loop Drop-linux-ia32')) {
    targets.push('build/Loop Drop-linux-ia32/demo-project')
  }

  if (fs.existsSync('build/Loop Drop-linux-x64')) {
    targets.push('build/Loop Drop-linux-x64/demo-project')
  }

  each(targets, function (dest, i, next) {
    cpr(buildFrom + '/demo-project', dest, {
      filter: /backup|preroll.wav|~recordings/
    }, next)
  }, packageRelease)
}

function packageRelease () {
  if (platform === 'darwin' || platform === 'all') {
    packageForMac()
  }

  if (platform === 'linux' || platform === 'all') {
    if (arch === 'ia32' || arch === 'all') {
      packageForLinux('ia32')
    }

    if (arch === 'ia32' || arch === 'all') {
      packageForLinux('x64')
    }
  }

  if (platform === 'win32' || platform === 'all') {
    if (arch === 'ia32' || arch === 'all') {
      packageForWindows('ia32')
    }

    if (arch === 'ia32' || arch === 'all') {
      packageForWindows('x64')
    }
  }
}

function packageForMac () {
  var outputPath = 'releases/Loop Drop v' + appPackage.version + '.dmg'
  rimraf.sync(outputPath)

  console.log('Signing app bundle')

  var bundle = 'build/Loop Drop-darwin-x64/Loop Drop.app'
  sign({
    app: bundle
  }, function (err) {
    if (err) throw err
    console.log('Creating dmg')
    appdmg({
      basepath: __dirname,
      target: outputPath,
      specification: {
        'title': 'Loop Drop',
        'icon': 'dmg.icns',
        'background': 'dmg.png',
        'icon-size': 100,
        'contents': [
          { x: 430, y: 190, type: 'link', path: '/Applications' },
          { x: 170, y: 190, type: 'file', path: bundle }
        ]
      }
    }).on('finish', function () {
      console.log('Output to ' + path.resolve(outputPath))
    }).on('error', function (err) {
      throw err
    })
  })
}

function packageForWindows (arch) {
  console.log('Creating msi')
  var outputPath = arch === 'x64'
    ? 'releases/Loop Drop v' + appPackage.version + ' x64.msi'
    : 'releases/Loop Drop v' + appPackage.version + '.msi'

  packageMsi({
    source: 'build/Loop Drop-win32-' + arch,
    upgradeCode: '9426ec3a-a291-4c1e-a31b-2e2ac38b78c8',
    output: outputPath,
    arch: arch === 'ia32' ? 'x86' : 'x64',
    iconPath: 'icon.ico',
    name: 'Loop Drop',
    version: appPackage.version,
    manufacturer: 'loopjs.com',
    executable: 'Loop Drop.exe',
    localInstall: true
  }, function (err) {
    if (err) throw err
    console.log('Output to ' + path.resolve(outputPath))
  })
}

function packageForLinux (arch) {
  console.log('Creating zip')
  var buildPath = __dirname + '/build/Loop Drop-linux-' + arch
  var outputPath = __dirname + '/releases/Loop Drop v' + appPackage.version + '-linux-' + arch + '.zip'
  rimraf.sync(outputPath)
  rimraf.sync(buildPath + '/LICENSE')
  fs.writeFileSync(buildPath + '/LICENSE-AGPL-3.0.txt', fs.readFileSync(buildFrom + '/LICENSE-AGPL-3.0.txt'))
  fs.writeFileSync(buildPath + '/README.md', fs.readFileSync(buildFrom + '/README.md'))
  execFileSync('zip', ['-r', '-X', outputPath, 'Loop Drop-linux-' + arch], {
    cwd: __dirname + '/build'
  })
}
