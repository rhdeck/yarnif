# yarnif

Exposes functions for running yarn or npm for package management

# Usage

```
yarnif = require('yarnif');
//...Assuming you have set cwd to the project base you want to modify
yarnif.addDependency('mypackage');
```

# Functions:

## useYarn([doUseYarn])

**Boolean** Whether to use `yarn` for other functions. Pass a boolean
`doUseYarn` value to force future calls to use yarn or npm going forward in this
runtime.

## addDependency(dependency)

Installs and saves dependency to `./package.json`

## addDevDependency

Installs and saves development dependency to `./package.json`

## addPeerDependency

Installs and saves peer dependency to `./package.json`
