import KetClient from "../../Main";
import { SlashCommandBuilder } from "@discordjs/builders";
import { execSync } from "child_process";
import { inspect } from "util";
import CommandStructure, { CommandContext, EmbedBuilder } from '../../Components/Commands/CommandStructure';

module.exports = class CldCommand extends CommandStructure {
    constructor(ket: KetClient) {
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
            data: new SlashCommandBuilder()
                .addStringOption(option =>
                    option.setName('command')
                        .setDescription('A command to be executed.')
                        .setRequired(true)
                )
        })
    }
    async execute(ctx: CommandContext) {
        let embed = new EmbedBuilder();

        try {
            let data: Buffer = execSync(ctx.args.join(' '));
            embed
                .setTitle('Só sucexo bb')
                .setColor('green')
                .setDescription(String(data), 'bash');
        } catch (e) {
            embed
                .setTitle('Ih deu merda viado')
                .setColor('red')
                .setDescription(inspect(e), 'bash');
        }

        return ctx.send({ content: { embeds: [embed.build()] } });
    }
}