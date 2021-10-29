#! /usr/bin/env node
const fs = require("fs");
const readline = require("readline");
const { argv } = require("yargs");
const { size } = fs.statSync(argv.sourceFile);
const readStream = fs.createReadStream(argv.sourceFile);
const loopsCount = Math.round(argv.sizeGB / (size / (1024 * 1024 * 1024)));
console.log(loopsCount, "loopsCount");
const rl = readline.createInterface({
  input: readStream,
  crlfDelay: Infinity,
});

let header = "";

rl.on("line", function (line, lineno = line_counter()) {
  if (lineno === 1) {
    header += line;
    !header &&
      fs.appendFile(argv.resultFile, header + "\n", function (err) {
        if (err) throw err;
      });
  } else {
    let buffer = "";
    for (let j = 0; j < loopsCount; j++) {
      buffer += line + "\n";
    }
    fs.appendFile(argv.resultFile, buffer, function (err) {
      if (err) throw err;
    });
  }
}).on("close", function () {
  console.log("Success!");
});

const line_counter = ((i = 0) => {
  return () => ++i;
})();
