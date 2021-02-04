import fs from 'fs';
import os from 'os';
import path from 'path';
import { parse } from 'subtitle';
import detectCharacterEncoding from 'detect-character-encoding';

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
      const outputFileName = fileName.replace(/srt$/, "txt");

      // Encoding
      const fileBuffer = fs.readFileSync(fileName);
      const fileEncoding = detectCharacterEncoding(fileBuffer);

      let subtitleText = "";
      let index = 0;

      fs.createReadStream(fileName, encodingTable[fileEncoding])
        .pipe(parse())
        .on('data', (node) => {
          if (node.type === 'cue') {
            const elem = node.data;
            const text = elem.text.replace(/\<\/*.*?\>/g, "").replace(/\n/g, " ");
            index++;

            if (text) {
              if (index % 20) {
                subtitleText += `${text} `;

              } else {
                subtitleText += `${text}\n`;
              }
            }
          }
        })
        .on('finish', () => {
          const foramttedText = subtitleText.replace(/\s\s/g, " ");
          fs.writeFileSync(outputFileName, foramttedText);
        });
    } else {
      console.log("Conversion failed. Make sure you are in the Downloads folder and there is no more than one srt file present!");
    }
  }
});

