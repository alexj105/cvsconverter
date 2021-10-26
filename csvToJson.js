#! /usr/bin/env node
const fs = require("fs");
const { Transform } = require("stream");
const readline = require("readline");
const { argv } = require("yargs");
const possibleDelimiters = [",", ";", "\t"];

const readStream = fs.createReadStream(argv.sourceFile);

const rl = readline.createInterface({
  input: readStream,
  crlfDelay: Infinity,
});

// onData

let headerKeys = [];
let separator = argv.separator || "";

rl.on("line", function (line, lineno = line_counter()) {
  if (lineno === 1) {
    separator = guessDelimiters(line, possibleDelimiters);
    headerKeys = line.toString().split(separator);
    fs.writeFileSync(argv.resultFile, '{"result":[', function (err) {
      if (err) throw err;
    });
  } else if (lineno === 2) {
    let jsonItem = JSON.stringify(keyValueMatcher(line, headerKeys, separator));
    fs.appendFileSync(argv.resultFile, jsonItem + "\n", function (err) {
      if (err) throw err;
    });
  } else {
    let jsonItem = JSON.stringify(keyValueMatcher(line, headerKeys, separator));
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
  let resultObj = valuesArray.reduce((acc, item, index) => {
    acc[keys[index]] = item;
    return acc;
  }, {});
  console.log(resultObj);
  return resultObj;
};

function guessDelimiters(text, possibleDelimiters) {
  return possibleDelimiters.filter(weedOut);

  function weedOut(delimiter) {
    let cache = -1;
    return text.split("\n").every(checkLength);

    function checkLength(line) {
      if (!line) {
        return true;
      }

      let length = line.split(delimiter).length;
      if (cache < 0) {
        cache = length;
      }
      debugger;
      return cache === length && length > 1;
    }
  }
}
