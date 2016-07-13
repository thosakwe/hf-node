require('babel-register');
require('dotenv').load();
require('babel-polyfill');

var HackForums = require('../src');

(async function() {
  var client = new HackForums({show: false});
  await client.login(process.env.HF_USER, process.env.HF_PASS);
  const messages = await client.getInbox();
  if (!messages.length)
    console.log('No mail here!');
  else {
    console.log(await client.readPm(messages[0].id));
  }

  await client.close();
})();
