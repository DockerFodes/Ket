export { };
import Eris from "eris";
const
    { exec } = require('child_process'),
    util = require('util'),
    { CommandStructure, EmbedBuilder } = require('../../components/Commands/CommandStructure');

module.exports = class CldCommand extends CommandStructure {
    constructor(ket: Eris.Client) {
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
            dontType: false,
            testCommand: ['node -v'],
            slashData: null
        })
    }
    async execute({ message, args }) {
        let embed: typeof EmbedBuilder;

        try {
            await exec(args.join(' '), (_a: string, b: string) => {
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
    async slash({ interaction, args }) {

    }
}