import KetClient from "../../Main";
import { SlashCommandBuilder } from "@discordjs/builders";
import { execSync } from "child_process";
import { inspect } from "util";
import CommandStructure, { EmbedBuilder } from '../../Components/Commands/CommandStructure';
import Prisma from "../../Components/Database/PrismaConnection";

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
    async execute(ctx) {
        let embed = new EmbedBuilder();

        try {
            let data: any = execSync(ctx.args.join(' '));
            embed
                .setTitle('Só sucexo bb')
                .setColor('green')
                .setDescription(data, 'bash');
        } catch (e) {
            embed
                .setTitle('Ih deu merda viado')
                .setColor('red')
                .setDescription(inspect(e), 'bash');
        }
        return this.ket.send({ context: ctx.env, content: { embeds: [embed.build()] } })
    }
}