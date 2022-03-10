const axios = require('axios');
require('dotenv').config();
const Discord = require('discord.js');
const { WebhookClient } = require('discord.js');

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const webhookClient = new WebhookClient({ id: process.env.WEBHOOKID, token: process.env.WEBHOOKTOKEN });

function callWebhook(client, reddit, posted) {
  const userName = client.user.tag.split('#');
  const { subreddit_name_prefixed: subReddit, title, url, id } = reddit.data.children[9].data;
  if (posted.includes(id) == false) { //Check if id has been saved
    webhookClient.send({
      username: subReddit + ' ● ' + userName[0],
      content: title + '\n' + url
    });
    posted.push(id); //save id
    console.log(subReddit + ': ' + posted.length);
    if (posted.length == 25) { //save last 25 id's
      posted.shift();
    };
  };
};

// const posted = [];
// let interval;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({ activities: [{ name: 'Reddit', type: 'WATCHING' }], status: 'online' });

  //   interval = setInterval(async function () {
  //     const reddit = await getReddit();
  //     if (reddit != null) {
  //       callWebhook(client, reddit, posted);
  //     }
  //   }, 30000); //check every 30 seconds
});

client.on('messageCreate', async msg => {
  switch (msg.content) {
    case "!post":
      msg.channel.send("Here's your post!");
      const reddit = await getReddit();
      if (reddit != null) {
        const { title, url } = reddit.data.children[9].data;
        msg.channel.send(title + "\n" + url);
      }
      break;
  }
});

async function getReddit() {
  try {
    const res = await axios.get('https://www.reddit.com/r/<subreddit>/hot.json?limit=10')
    return res.data; //res.status = 200
  } catch (error) {
    if (error.response) {
      // console.log(error.response.data);
      // console.log(error.response.status);
      // console.log(error.response.headers);
    }
  }
}

client.login(process.env.CLIENT_TOKEN);