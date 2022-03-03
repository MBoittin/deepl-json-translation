const translate = require("deepl");
var fs = require('fs');
var inquirer = require('inquirer');

let target_lang = ''
let apiKey = ''
let free = ''

const files = process.argv.slice(2)

files.forEach((file) => {
  const json = require(file)
  const fileSplit = file.split('/')
  const fileName = fileSplit[fileSplit.length - 1].split('.')[0]

  inquirer
  .prompt([{
    type: 'list',
    name: 'language',
    message: 'Select an language for the traduction',
    choices: ["BG", "CS", "DA", "DE", "EL", "EN-GB", "EN-US", "EN", "ES", "ET", "FI", "FR", "HU", "IT", "JA", "LT", "LV", "NL", "PL", "PT-PT", "PT-BR", "PT", "RO", "RU", "SK", "SL", "SV", "ZH"],
  },
  {
    type: 'input',
    name: 'apiKey',
    message: 'please provide your api key'
  },
  {
    type: 'list',
    name: 'free',
    message: 'Is this a free api key ?',
    choices: ['Yes', 'No']
  }
  ])
  .then((answers) => {
    target_lang = answers.language
    apiKey = answers.apiKey
    free = answers.free === "Yes" ? true : false
    buffer(json, fileName)
  })


})

async function buffer(json, fileName) {
  await recursiveObjectTranslation(json)
  fs.writeFile(`${fileName}.translate.json`, JSON.stringify(json, null, 2), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
}

async function recursiveObjectTranslation(object) {
  await Promise.all(Object.keys(object).map(async (key) => {
    if (typeof object[key] === 'string') {
      try {
        const result = await translate({
          free_api: free,
          text: object[key],
          target_lang,
          auth_key: apiKey,
        })
        console.log('translating', object[key], '\x1b[33mto\x1b[0m', result.data.translations[0].text)
        object[key] = result.data.translations[0].text
      } catch (err) {
        console.error(err)
      }
    }
    else if (typeof object[key] === 'object') {
      await recursiveObjectTranslation(object[key])
    }
  }))
  return
}


