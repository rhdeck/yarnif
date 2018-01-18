const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const semver = require("semver");
var allowYarn;
// Use Yarn if available, it's much faster than the npm client.
// Return the version of yarn installed on the system, null if yarn is not available.
function useYarn(setYarn) {
  if (typeof setYarn !== "undefined") {
    allowYarn = setYarn;
  }
  if (typeof allowYarn !== "undefined") {
    return allowYarn;
  }
  return getYarnVersionIfAvailable() ? true : false;
}
function getYarnVersionIfAvailable() {
  var yarnVersion;
  try {
    // execSync returns a Buffer -> convert to string
    if (process.platform.startsWith("win")) {
      yarnVersion = (cp.execSync("yarn --version").toString() || "").trim();
    } else {
      yarnVersion = (
        cp.execSync("yarn --version 2>/dev/null").toString() || ""
      ).trim();
    }
  } catch (error) {
    return null;
  }
  // yarn < 0.16 has a 'missing manifest' bug
  try {
    if (semver.gte(yarnVersion, "0.16.0")) {
      return yarnVersion;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Cannot parse yarn version: " + yarnVersion);
    return null;
  }
}
function addDependency(dependency, qualifier) {
  dependency = fixDependency(dependency);
  var cmd;
  if (useYarn()) {
    cmd = "yarn add " + dependency;
  } else {
    cmd = "npm i --save " + dependency;
  }
  cp.execSync(cmd, { stdio: "inherit" });
}

function addDevDependency(dependency, qualifier) {
  dependency = fixDependency(dependency);
  var cmd;
  if (useYarn()) {
    cmd = "yarn add -D " + dependency;
  } else {
    cmd = "npm i --save-dev " + dependency;
  }
  cp.execSync(cmd, { stdio: "inherit" });
}
function addPeerDependency(dependency, qualifier) {
  dependency = fixDependency(dependency);
  var cmd;
  if (useYarn()) {
    cmd = "yarn add -P " + dependency;
  } else {
    cmd = "npm i --save" + dependency;
    cp.execSync(cmd, { stdio: "inherit" });
    //Open package.json and save
    const packagePath = path.resolve(process.cwd(), "package.json");
    if (fs.existsSync(packagePath)) {
      const json = fs.readSync();
      var obj = JSON.parse(json);
      if (obj) {
        if (!obj.peerDependencies) {
          obj.peerDependencies = {};
        }
        obj.peerDependencies[dependency] = obj.dependencies[dependency];
        delete obj.dependencies[dependency];
      }
      const outjson = JSON.stringify(obj, null, 2);
      fs.writeFileSync(packagePath, outjson);
    }
  }
}

function install() {
  var cmd;
  if (useYarn()) {
    cmd = "yarn install";
  } else {
    cmd = "npm i";
  }
  cp.execSync(cmd, { stdio: "inherit" });
}

function exec(args) {
  var cmd;
  if (typeof args == "string") {
    args = [args];
  }
  if (useYarn()) {
    cmd = "yarn";
  } else {
    cmd = "npm";
    args = ["run", ...args];
  }
  cp.spawnSync(cmd, args, { stdio: "inherit" });
}

function fixDependency(oldDependency) {
  if (oldDependency && oldDependency.startsWith(".")) {
    return path.resolve(oldDependency);
  } else {
    return oldDependency;
  }
}
module.exports = {
  useYarn,
  addDependency,
  addDevDependency,
  addPeerDependency,
  install,
  exec
};
