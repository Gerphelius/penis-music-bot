import 'dotenv/config';

import { Client, GatewayIntentBits, Events, type Interaction, GuildMember, TextChannel } from 'discord.js';
import {
  joinVoiceChannel,
  getVoiceConnection,
  entersState,
  VoiceConnectionStatus,
} from '@discordjs/voice';

import { createPlayer, stopCurrent } from './player.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

let textChannel: TextChannel | null;

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "play") {
    const channel = (interaction.member as GuildMember).voice.channel;

    if (!channel) {
      return await interaction.reply("You need to be in a voice channel first!");
    }

    try {
      let connection = getVoiceConnection(channel.guild.id);

      if (!connection) {
        connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });

        // await interaction.followUp(`Joined ${channel.name}!`);
      }

      textChannel = interaction.channel as TextChannel;

      await entersState(connection, VoiceConnectionStatus.Ready, 20_000);

      createPlayer(interaction.options.getString('url')!, connection);

      return await interaction.reply(`Audio is playing...`);
    } catch (error) {
      console.error("ERROR: ", error);

      return await interaction.reply("Failed to join the voice channel.");
    }
  }

  if (interaction.commandName === "stop") {
    stopCurrent();

    return await interaction.reply("Stopped.");
  }

  return await interaction.reply("Unknown error.");
});

client.on("voiceStateUpdate", (state) => {
  const connection = getVoiceConnection(state.guild.id);

  if (!connection) return;

  const channel = connection.joinConfig.channelId;
  const voiceChannel = state.guild.channels.cache.get(channel!);

  if (!voiceChannel || voiceChannel.type !== 2) return;

  const members = voiceChannel.members.filter(member => !member.user.bot);

  if (members.size === 0) {
    console.log("No users left in the voice channel, leaving...");
    textChannel?.send("No users left in the voice channel, leaving...");
    stopCurrent();
    connection.destroy();
  }
});

client.login(process.env.DISCORD_TOKEN);
