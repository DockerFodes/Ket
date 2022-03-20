import KetClient from "../../Main";
import { SlashCommandBuilder } from "@discordjs/builders";
import { execSync } from "child_process";
import CommandStructure, { CommandContext, EmbedBuilder, getEmoji } from '../../Components/Commands/CommandStructure';
import { duration } from "moment";

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
        const
            initialTime = Date.now(),
            initialRamUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
            query = async (query: string) => (await ctx.postgres.query(query)).rows;

        let embed = new EmbedBuilder();

        try {
            let data: Buffer = execSync(ctx.args.join(' '));
            embed
                .setTitle('Só sucexo bb')
                .setColor('green')
                .setDescription(String(data) || 'Sem retorno.', 'fix');
        } catch (e) {
            embed
                .setTitle('Ih deu merda viado')
                .setColor('red')
                .setDescription(String(e), 'fix');
        }
        embed
            .addField("⏰ runtime: ", duration(Date.now() - initialTime).format('dd[d] hh[h] mm[m] ss[s] S[ms]').encode('fix'), true)
            .addField("🎞️ Ram usage: ", `- ${initialRamUsage}/${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}MB`.encode('diff'), true)
            .addField(`${getEmoji('cristal').mention} Shard id: `, `# ${ctx.shard.id}/${this.ket.shards.size}`.encode('md'), true);

        ctx.send({ content: { embeds: [embed.build()] } });
        return;
    }
}