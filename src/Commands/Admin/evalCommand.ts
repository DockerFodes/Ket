import { EmbedBuilder, getEmoji, getColor, CommandContext } from "../../Components/Commands/CommandStructure";
import { SlashCommandBuilder } from "@discordjs/builders";
import { duration } from "moment";
import Command from "../../Components/Classes/Command";

const
    axios = require('axios'),
    Eris = require('eris'),
    fs = require('fs'),
    util = require('util'),
    translator = require("../../Components/Core/Translator"),
    moment = require("moment"),
    path = require('path');

module.exports = class Eval extends Command {
    public aliases = ['e']
    public cooldown = 1
    public permissions = {
        onlyDevs: true
    };
    public access = {
        DM: true,
        Threads: true
    }
    public testCommand: ['ctx.send({ content: "cu"})'];
    public dir = __filename;
    public slash = new SlashCommandBuilder().addStringOption(option =>
        option.setName("code")
            .setDescription("Some code.")
            .setRequired(true)
    )

    public async execute(ctx: CommandContext) {
        const
            initialTime = Date.now(),
            initialRamUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
            query = async (query: string) => (await this.postgres.query(query)).rows;

        let
            res: string,
            message = ctx.env,
            canReturn = ctx.commandName === 'eval' ? true : false,
            embed = new EmbedBuilder(),
            code = ctx.args.join(" ")
                .replace('```js', '')
                .replace('```', '')
                .replace(/val /g, 'global.');

        function filtrar(content: unknown): string {
            return content = !content
                ? '- Sem retorno.'.encode('diff')
                : util.inspect(content)
                    .replace(new RegExp(
                        `(${process.env.DISCORD_TOKEN}|${process.env.BETA_CLIENT_TOKEN}|${process.env.DATABASE}|${process.env.PASSWORD}|${process.env.USER}|${process.env.HOST})`,
                        'gi'), 'censored key')
                    .replace(new RegExp('`', 'gi'), '\\`')
                    .slice(0, 3080)
                    .encode('js');
        }

        try {
            if (code.includes('await')) res = await eval(`(async () => { ${code} })()`);
            else res = await eval(code);

            embed
                .setColor('green')
                .setTitle('Retorno:')
                .setDescription(filtrar(res));
        } catch (e) {
            embed
                .setColor('red')
                .setTitle('Erro:')
                .setDescription(filtrar(e));

            canReturn = true;
        } finally {
            if (canReturn) {
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

                this.ket.send({ ctx, content: { embeds: [embed.build()] } });
            }
        }

        return;
    }
}