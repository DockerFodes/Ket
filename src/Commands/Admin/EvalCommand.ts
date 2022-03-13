import { SlashCommandBuilder } from "@discordjs/builders";
import { duration } from "moment";
import CommandStructure, { EmbedBuilder, getEmoji, getColor, CommandContext } from "../../Components/Commands/CommandStructure";
import KetUtils from "../../Components/Core/KetUtils";
import KetClient from "../../Main";

const
    axios = require('axios'),
    Eris = require('eris'),
    fs = require('fs'),
    util = require('util'),
    translate = require("../../Components/Core/Translator"),
    moment = require("moment"),
    path = require('path');

module.exports = class EvalCommand extends CommandStructure {
    utils: any;
    constructor(ket: KetClient) {
        super(ket, {
            name: 'eval',
            aliases: ['e'],
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
            dontType: true,
            testCommand: ['ctx.channel.createMessage("alow")'],
            data: new SlashCommandBuilder().addStringOption(option =>
                option.setName("code")
                    .setDescription("Some code.")
                    .setRequired(true)
            )
        })
        this.utils = new (KetUtils)(this.ket);
    }
    async execute(ctx: CommandContext) {
        const
            ket = this.ket,
            utils = this.utils,
            time = Date.now(),
            AsyncFunction = (async function () { }).constructor;
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
                .replace(new RegExp(`(${ket._token}|${process.env.DATABASE_URL})`, 'gi'), 'censored key');
        }

        try {
            if (code.includes('await')) evaled = await AsyncFunction(code)();
            else evaled = await eval(code);

            embed.addField("Tempo de execução: ", '0');
            embed
                .setColor('green')
                .addField('Retorno: ', filtrar(evaled).encode('js'));
        } catch (e) {
            embed
                .setColor('red')
                .addField('Erro: ', filtrar(e).encode('js'));
            canReturn = true;
        } finally {
            embed.fields[0].value = duration(Date.now() - time).format('dd[d] hh[h] mm[m] ss[s] S[ms]').encode('fix')
            if (canReturn) return this.ket.send({ ctx, content: { embeds: [embed.build()] } });
        }
        return;
    }
}