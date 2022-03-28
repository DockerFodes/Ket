import { CommandContext, EmbedBuilder, getEmoji } from '../../Components/Commands/CommandStructure';
import { SlashCommandBuilder } from "@discordjs/builders";
import { execSync } from "child_process";
import { duration } from "moment";
import Command from '../../Components/Classes/Command';

module.exports = class Cld extends Command {
    public cooldown = 1;
    public permissions = {
        onlyDevs: true
    };
    public access = {
        DM: true,
        Threads: true
    };
    public testCommand = ['node -v'];
    public dir = __filename;
    public slash = new SlashCommandBuilder()
        .addStringOption(option =>
            option.setName('command')
                .setDescription('A command to be executed.')
                .setRequired(true)
        )

    public async execute(ctx: CommandContext) {
        const
            initialTime = Date.now(),
            initialRamUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);

        let embed = new EmbedBuilder(),
            res: Buffer;

        function filtrar(content: unknown): string {
            return content = !content
                ? '- Sem retorno.'.encode('diff')
                : String(content)
                    .replace(new RegExp(
                        `(${process.env.DISCORD_TOKEN}|${process.env.BETA_CLIENT_TOKEN}|${process.env.DATABASE}|${process.env.PASSWORD}|${process.env.USER}|${process.env.HOST})`,
                        'gi'), 'censored key')
                    .replace(new RegExp('`', 'gi'), '\\`')
                    .slice(0, 3080)
                    .encode('bash');
        }

        try {
            res = execSync(ctx.args.join(' '));

            embed
                .setColor('green')
                .setTitle('Retorno:')
                .setDescription(filtrar(res));
        } catch (e) {
            embed
                .setColor('red')
                .setTitle('Erro:')
                .setDescription(filtrar(e));
        }
        embed
            .addField("⏰ Duration: ",
                duration(Date.now() - initialTime)
                    .format('dd[d] hh[h] mm[m] ss[s] S[ms]')
                    .encode('fix'), true)
            .addField("🎞️ Ram increase: ",
                `- ${initialRamUsage}/${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}MB`
                    .encode('diff'), true)
            .addField(`${getEmoji('cristal').mention} ShardID: `,
                `# ${ctx.shard.id}/${this.ket.shards.size}`
                    .encode('md'), true);

        ctx.send({ content: { embeds: [embed.build()] } });

        return;
    }
}