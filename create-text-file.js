import fs from 'fs';
import os from 'os';
import path from 'path';
import { parse, map, filter } from 'subtitle';
import detectCharacterEncoding from 'detect-character-encoding';

let subtitleText = "";

const encodingTable = {
  "ISO-8859-1": "latin1",
  "UTF-8": "utf8"
};

const homedir = os.homedir();

const downloadDir = path.join(homedir, '/Downloads');

fs.readdir(downloadDir, function (err, files) {
  if (err) {
    console.log("File cannot be properly processed for the following reason:", err);

  } else {
    const srtFiles = files.filter(el => path.extname(el).toLowerCase() === ".srt");

    if (srtFiles && srtFiles.length === 1) {
      const fileName = path.join(downloadDir, srtFiles[0]);

      // Encoding
      const fileBuffer = fs.readFileSync(fileName);
      const fileEncoding = detectCharacterEncoding(fileBuffer);

      fs.createReadStream(fileName, encodingTable[fileEncoding])
        .pipe(parse())
        .on('data', node => {
          if (node.type === 'cue') {
            const elem = node.data;
            const text = elem.text.trim().replace(/\n/, "");

            if (text) subtitleText += `${text} `;
          }
        })
        .on('finish', () => {
          fs.writeFileSync(`${downloadDir}/new-subtitle-text.txt`, subtitleText);
          console.log("subtitleText", subtitleText);
        });
    } else {
      console.log("Conversion failed. Make sure you are in the Downloads folder and there is no more than one srt file present!");
    }
  }
});

setTimeout(() => {

}, 2000);

