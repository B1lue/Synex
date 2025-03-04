import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import axios from 'axios';
import { config } from './config';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
    console.log(`Received message: ${message.content}`);
    if (message.content.startsWith('!dropitem')) {
        const args = message.content.split(' ').slice(1);
        if (args.length !== 3) {
            message.reply('Usage: \\!dropitem [ID] [Item] [Quantity]');
            console.log('Invalid command usage.');
            return;
        }

        const [playerId, item, quantity] = args;
        console.log(`Parsed command arguments: playerId=${playerId}, item=${item}, quantity=${quantity}`);
        const approvalChannel = message.guild?.channels.cache
            .find(channel => channel.name === 'aprovacao-drops') as TextChannel;

        if (!approvalChannel) {
            message.reply('Approval channel not found.');
            console.log('Approval channel not found.');
            console.log(`Available channels: ${message.guild?.channels.cache.map(channel => channel.name).join(', ')}`);
            return;
        }

        console.log(`Found approval channel: ${approvalChannel.name}`);

        try {
            const approvalMessage = await approvalChannel.send(
                `Solicitação de drop: ID: ${playerId} quer ${quantity}x ${item}. Reaja com \\✅ ou \\❌.`
            );
            console.log('Approval message sent.');

            await approvalMessage.react('✅');
            await approvalMessage.react('❌');
            console.log('Reactions added to approval message.');

            const filter = (reaction: any, user: any) =>
                ['✅', '❌'].includes(reaction.emoji.name) && !user.bot;
            const collector = approvalMessage.createReactionCollector({ filter, max: 1 });

            collector.on('collect', async (reaction) => {
                console.log(`Reaction collected: ${reaction.emoji.name}`);
                if (reaction.emoji.name === '✅') {
                    try {
                        await axios.post(`${config.fivemServerUrl}/dropitem`, {
                            playerId,
                            item,
                            quantity
                        });
                        message.reply(`Item \\${item}\\ foi entregue ao ID \\${playerId}\\.`);
                        console.log('Item delivered successfully.');
                    } catch (error) {
                        message.reply('Erro ao contatar o servidor FiveM.');
                        console.error('Error contacting FiveM server:', error);
                    }
                } else {
                    message.reply('Solicitação de drop negada.');
                    console.log('Drop request denied.');
                }
            });
        } catch (error) {
            console.error('Error sending approval message or adding reactions:', error);
        }
    }
});

client.login(config.discordToken).catch(error => {
    console.error('Error logging in:', error);
});