#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Đọc version từ package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = packageJson.version;

// Cập nhật .env.development
const devEnvPath = '.env.development';
if (fs.existsSync(devEnvPath)) {
  let devContent = fs.readFileSync(devEnvPath, 'utf8');
  devContent = devContent.replace(
    /APP_VERSION=.*/,
    `APP_VERSION=${currentVersion}-dev`
  );
  fs.writeFileSync(devEnvPath, devContent);
  console.log(`✅ Cập nhật .env.development: ${currentVersion}-dev`);
}

// Cập nhật .env.production
const prodEnvPath = '.env.production';
if (fs.existsSync(prodEnvPath)) {
  let prodContent = fs.readFileSync(prodEnvPath, 'utf8');
  prodContent = prodContent.replace(
    /APP_VERSION=.*/,
    `APP_VERSION=${currentVersion}`
  );
  fs.writeFileSync(prodEnvPath, prodContent);
  console.log(`✅ Cập nhật .env.production: ${currentVersion}`);
}

// Cập nhật .env.example
const exampleEnvPath = '.env.example';
if (fs.existsSync(exampleEnvPath)) {
  let exampleContent = fs.readFileSync(exampleEnvPath, 'utf8');
  exampleContent = exampleContent.replace(
    /APP_VERSION=.*/,
    `APP_VERSION=${currentVersion}`
  );
  fs.writeFileSync(exampleEnvPath, exampleContent);
  console.log(`✅ Cập nhật .env.example: ${currentVersion}`);
}

console.log(`🎉 Hoàn thành cập nhật version: ${currentVersion}`);
