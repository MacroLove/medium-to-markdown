const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

function main(subfolderName) {
  const htmlFilesFolder = `data/html/${subfolderName}`;
  const files = fs
    .readdirSync(htmlFilesFolder)
    .filter(file => path.extname(file) === '.html');
  const outputMdFolder = `data/md/${subfolderName}`;

  if (!fs.existsSync(outputMdFolder)) {
    fs.mkdirSync(outputMdFolder, { recursive: true });
  }

  files.forEach(file => {
    const url = `http://127.0.0.1:5500/${htmlFilesFolder}/${file}`;
    const outputFileName = path.parse(file).name + '.md';
    const outputFile = path.join(outputMdFolder, outputFileName);
    const command = `pnpm convert ${url} > "${outputFile}"`;

    try {
      execSync(command, { shell: true });
      console.log(`Converted ${file} to ${outputFileName}`);
    } catch (error) {
      console.error(`Error converting ${file}: ${error.message}`);
    }
  });
}

// Set the subfolder name here
const subfolderName = 'anomaly-detection';
main(subfolderName);
