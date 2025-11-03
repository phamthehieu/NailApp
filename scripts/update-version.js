const fs = require('fs');
const path = require('path');

// Đọc version từ package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');
const iosProjectPath = path.join(__dirname, '..', 'ios', 'NailApp.xcodeproj', 'project.pbxproj');

// Lấy version từ command line hoặc từ package.json hiện tại
const newVersion = process.argv[2] || null;

function getVersionFromPackageJson() {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return packageJson.version;
}

function parseVersion(versionString) {
  const parts = versionString.split('.');
  return {
    major: parseInt(parts[0] || '0', 10),
    minor: parseInt(parts[1] || '0', 10),
    patch: parseInt(parts[2] || '0', 10),
  };
}

function formatVersion(versionObj) {
  return `${versionObj.major}.${versionObj.minor}.${versionObj.patch}`;
}

function calculateVersionCode(versionObj) {
  // versionCode = major * 10000 + minor * 100 + patch
  return versionObj.major * 10000 + versionObj.minor * 100 + versionObj.patch;
}

// Cập nhật package.json
function updatePackageJson(version) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.version = version;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✓ Đã cập nhật package.json: ${version}`);
}

// Cập nhật Android build.gradle
function updateBuildGradle(version, versionCode) {
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
  
  // Cập nhật versionName
  buildGradle = buildGradle.replace(
    /versionName\s+"[^"]+"/,
    `versionName "${version}"`
  );
  
  // Cập nhật versionCode
  buildGradle = buildGradle.replace(
    /versionCode\s+\d+/,
    `versionCode ${versionCode}`
  );
  
  fs.writeFileSync(buildGradlePath, buildGradle);
  console.log(`✓ Đã cập nhật android/app/build.gradle: versionName="${version}", versionCode=${versionCode}`);
}

// Cập nhật iOS project.pbxproj
function updateIosProject(version, buildNumber) {
  if (!fs.existsSync(iosProjectPath)) {
    console.log('⚠ Không tìm thấy iOS project file, bỏ qua cập nhật iOS');
    return;
  }
  
  let projectContent = fs.readFileSync(iosProjectPath, 'utf8');
  
  // Cập nhật MARKETING_VERSION (version hiển thị)
  projectContent = projectContent.replace(
    /MARKETING_VERSION = [^;]+;/g,
    `MARKETING_VERSION = ${version};`
  );
  
  // Cập nhật CURRENT_PROJECT_VERSION (build number)
  projectContent = projectContent.replace(
    /CURRENT_PROJECT_VERSION = [^;]+;/g,
    `CURRENT_PROJECT_VERSION = ${buildNumber};`
  );
  
  fs.writeFileSync(iosProjectPath, projectContent);
  console.log(`✓ Đã cập nhật iOS project: MARKETING_VERSION=${version}, CURRENT_PROJECT_VERSION=${buildNumber}`);
}

// Hàm chính
function main() {
  try {
    let targetVersion;
    
    if (newVersion) {
      // Sử dụng version được cung cấp
      targetVersion = newVersion;
    } else {
      // Tăng patch version
      const currentVersion = getVersionFromPackageJson();
      const versionObj = parseVersion(currentVersion);
      versionObj.patch += 1;
      targetVersion = formatVersion(versionObj);
    }
    
    // Validate version format
    if (!/^\d+\.\d+\.\d+$/.test(targetVersion)) {
      console.error('❌ Định dạng version không hợp lệ. Sử dụng format: major.minor.patch (ví dụ: 1.0.0)');
      process.exit(1);
    }
    
    const versionObj = parseVersion(targetVersion);
    const versionCode = calculateVersionCode(versionObj);
    
    console.log(`\n🔄 Đang cập nhật version sang ${targetVersion}...\n`);
    
    // Cập nhật các file
    updatePackageJson(targetVersion);
    updateBuildGradle(targetVersion, versionCode);
    updateIosProject(targetVersion, versionCode);
    
    console.log(`\n✅ Đã cập nhật version thành công!\n`);
    console.log(`Version: ${targetVersion}`);
    console.log(`Version Code (Android): ${versionCode}`);
    console.log(`Build Number (iOS): ${versionCode}`);
    
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật version:', error.message);
    process.exit(1);
  }
}

main();

