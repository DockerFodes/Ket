export { };
const
    { exec } = require('child_process'),
    util = require('util'),
    { CommandStructure, EmbedBuilder, Decoration } = require('../../components/CommandStructure'),
    emoji = (new Decoration()).getEmoji;

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
        let embed;

        try {
            await exec(args.join(' '), (a, b) => {
                embed = new EmbedBuilder()
                    .setTitle('Só sucexo bb')
                    .setColor('green')
                    .setDescription(b, 'bash');
                message.reply({ embed: embed.build() })
            })
        } catch (e) {
            embed = new EmbedBuilder()
                .setTitle('Ih deu merda viado')
                .setColor('red')
                .setDescription(util.inspect(e), 'bash');
            message.reply({ embed: embed.build() })
        }
    }
    async slash({ interaction, args }, t) {

    }
}