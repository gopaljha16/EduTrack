const fs = require('fs');
const path = require('path');

// Function to parse .env file simple key=value format
function loadEnvFile(filePath) {
  const envVars = {};
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const equalIdx = trimmed.indexOf('=');
        if (equalIdx > 0) {
          const key = trimmed.substring(0, equalIdx).trim();
          let val = trimmed.substring(equalIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          envVars[key] = val;
        }
      }
    });
  }
  return envVars;
}

const rootDir = path.join(__dirname, '..');
const envFileVars = loadEnvFile(path.join(rootDir, '.env'));

// Read BACKEND_URL from process.env (Vercel/Render envs) or .env file or fallback
const backendUrl = process.env.BACKEND_URL || 
                   process.env.API_URL || 
                   envFileVars.BACKEND_URL || 
                   envFileVars.API_URL || 
                   'http://localhost:3000/api';

const envDirPath = path.join(rootDir, 'src', 'environments');
if (!fs.existsSync(envDirPath)) {
  fs.mkdirSync(envDirPath, { recursive: true });
}

// Development Environment
const devEnvContent = `export const environment = {
  production: false,
  apiUrl: '${envFileVars.BACKEND_URL || 'http://localhost:3000/api'}'
};
`;

// Production Environment
const prodEnvContent = `export const environment = {
  production: true,
  apiUrl: '${backendUrl}'
};
`;

fs.writeFileSync(path.join(envDirPath, 'environment.ts'), devEnvContent, 'utf8');
fs.writeFileSync(path.join(envDirPath, 'environment.prod.ts'), prodEnvContent, 'utf8');

console.log(`✅ [set-env] Angular environment files updated! Production API URL: ${backendUrl}`);
