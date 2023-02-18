const { REST, Routes } = require('discord.js');
require('dotenv').config()
const axios = require('axios')


const commands = [
  {
    name: 'fact',
    description: 'Replies with a random fact.',
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();


const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'fact') {
    axios.get('https://api.api-ninjas.com/v1/facts?limit=1', {
        headers: {
            'X-Api-Key': process.env.API_KEY
        }
    })
    .then(response => {
        interaction.reply(response.data[0].fact);
    })
    .catch(error => {
        console.log(error)
    });
    
  }
});

client.login(process.env.TOKEN)