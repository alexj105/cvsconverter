#! /usr/bin/env node
const fs = require("fs");
const { Transform } = require("stream");
const readline = require("readline");
const { argv } = require("yargs");
const separator = argv.separator;

const readStream = fs.createReadStream(argv.sourceFile);

console.log(argv.sourceFile);
const rl = readline.createInterface({
  input: readStream,
  crlfDelay: Infinity,
});

// onData

let header = "";
rl.on("line", function (line, lineno = line_counter()) {
  console.log(lineno);
  if (lineno === 1) {
    header += line;
    console.log(header);
    fs.appendFileSync(argv.resultFile, '{"result":[', function (err) {
      if (err) throw err;
    });
  } else if (lineno === 2) {
    let jsonItem = JSON.stringify(keyValueMatcher(line, header));
    console.log(jsonItem.toString());
    fs.appendFileSync(argv.resultFile, jsonItem + "\n", function (err) {
      if (err) throw err;
    });
  } else {
    let jsonItem = JSON.stringify(keyValueMatcher(line, header));
    fs.appendFile(argv.resultFile, "," + jsonItem + "\n", function (err) {
      if (err) throw err;
    });
  }
}).on("close", function () {
  fs.appendFile(argv.resultFile, "]}", function (err) {
    if (err) throw err;
    console.log("Saved!");
  });
});

const line_counter = ((i = 0) => {
  return () => ++i;
})();

const keyValueMatcher = (values, keys, separator) => {
  let valuesArray = values.split(separator);
  let keysArray = keys.split(separator);
  let resultObj = valuesArray.reduce((acc, item, index) => {
    acc[keysArray[index]] = item;
    return acc;
  }, {});
  return resultObj;
};
