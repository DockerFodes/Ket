import CommandStructure, { EmbedBuilder, getEmoji, getColor, CommandContext } from "../../Components/Commands/CommandStructure";
import { SlashCommandBuilder } from "@discordjs/builders";
import { duration } from "moment";
import KetUtils from "../../Components/Core/KetUtils";

const
    axios = require('axios'),
    Eris = require('eris'),
    fs = require('fs'),
    util = require('util'),
    translator = require("../../Components/Core/Translator"),
    moment = require("moment"),
    path = require('path');

module.exports = class EvalCommand extends CommandStructure {
    aliases = ['e']
    cooldown = 1
    permissions = {
        onlyDevs: true
    };
    access = {
        DM: true,
        Threads: true
    }
    dontType = true;
    testCommand: ['ctx.channel.createMessage("alow")'];
    dir = __filename;
    slash = new SlashCommandBuilder().addStringOption(option =>
        option.setName("code")
            .setDescription("Some code.")
            .setRequired(true)
    )

    async execute(ctx: CommandContext) {
        const
            initialTime = Date.now(),
            initialRamUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
            query = async (query: string) => (await this.postgres.query(query)).rows,
            utils = new KetUtils(this.ket, this.postgres);


        let
            evaled,
            message = ctx.env,
            canReturn = (ctx.commandName === 'eval' ? true : false),
            embed = new EmbedBuilder(),
            code = ctx.args.join(" ")
                .replace('```js', '')
                .replace('```', '')
                .replace(/val /g, 'global.');

        function filtrar(content: unknown): string {
            return content = util.inspect(content)
                .replace(new RegExp(`(${process.env.DISCORD_TOKEN}|${process.env.BETA_CLIENT_TOKEN})`, 'gi'), 'censored key')
                .replace(new RegExp('`', 'gi'), '\\`')
                .slice(0, 3090);
        }

        try {
            if (code.includes('await')) evaled = await eval(`(async () => { ${code} })()`);
            else evaled = await eval(code);

            embed
                .setColor('green')
                .setTitle('Retorno:')
                .setDescription(filtrar(evaled) || 'Sem retorno.', 'js');
        } catch (e) {
            embed
                .setColor('red')
                .setTitle('Erro:')
                .setDescription(filtrar(e), 'js');

            canReturn = true;
        } finally {
            if (canReturn) {
                embed
                    .addField("⏰ runtime: ", duration(Date.now() - initialTime).format('dd[d] hh[h] mm[m] ss[s] S[ms]').encode('fix'), true)
                    .addField("🎞️ Ram usage: ", `- ${initialRamUsage}/${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}MB`.encode('diff'), true)
                    .addField(`${getEmoji('cristal').mention} Shard id: `, `# ${ctx.shard.id}/${this.ket.shards.size}`.encode('md'), true);

                this.ket.send({ ctx, content: { embeds: [embed.build()] } });
            }
        }
        return;
    }
}