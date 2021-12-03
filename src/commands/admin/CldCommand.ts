export { }
const
    { exec } = require('child_process'),
    util = require('util'),
    { CommandStructure, EmbedBuilder, Decoration } = require('../../components/CommandStructure'),
    emoji = (new Decoration()).emojis;

module.exports = class CldCommand extends CommandStructure {
    constructor(ket) {
        super(ket, {
            name: 'cld',
            aliases: [],
            category: 'admin',
            cooldown: 1,
            permissions: {
                user: [],
                bot: [],
                onlyDevs: true
            },
            access: {
                DM: true,
                Threads: true
            },
            testCommand: ['node -v'],
            slashData: null
        })
    }
    async execute({ message, args }, t) {
        const ket = this.ket
        let embed, msg;
        if (!message.editedTimestamp) msg = await message.channel.createMessage({ content: emoji('carregando') }).catch(() => { });
        else msg = await ket.editMessage(global.client.cldMessage.channelID, global.client.cldMessage.messageID, { content: emoji('carregando'), embeds: [], components: [] }).catch(() => { });

        try {
            await exec(args.join(' '), (a, b) => {
                embed = new EmbedBuilder()
                    .setTitle('Só sucexo bb')
                    .setColor('green')
                    .setDescription(b, 'bash')
                msg.edit(embed.build()).catch(() => { });
                return global.client.cldMessage = {
                    messageID: msg.id,
                    channelID: msg.channel.id
                }
            })
        } catch (e) {
            embed = new EmbedBuilder()
                .setTitle('Ih deu merda viado')
                .setColor('red')
                .setDescription(util.inspect(e), 'bash')
            msg.edit(embed.build()).catch(() => { });
            return global.client.cldMessage = {
                messageID: msg.id,
                channelID: msg.channel.id
            }
        }
    }
    async slash({ interaction, args }, t) {

    }
}