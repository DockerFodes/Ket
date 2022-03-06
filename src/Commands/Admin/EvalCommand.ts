import { SlashCommandBuilder } from "@discordjs/builders";
import CommandStructure, { EmbedBuilder, getEmoji, getColor, CommandContext } from "../../Components/Commands/CommandStructure";
import KetUtils from "../../Components/Core/KetUtils";
import KetClient from "../../Main";

const
    axios = require('axios'),
    cld = require('child_process'),
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
            prisma = ctx.prisma,
            utils = this.utils;
        let
            message = ctx.env,
            evaled = ctx.args.join(" ")
                .replace('```js', '')
                .replace('```', '')
                .replace(/val /g, 'global.'),
            canReturn = (ctx.commandName === 'eval' ? true : false),
            embed = new EmbedBuilder(),
            mb = (data: number) => Math.floor(data / 1024 / 1024) + "MB";

        function filtrar(content: unknown) {
            return content = util.inspect(content)
                .replace(new RegExp(ket._token, 'gi'), 'censored key')
        }

        try {
            if (ctx.args.join(' ').includes('await')) evaled = await eval(`async function bah() {${evaled}};bah()`);
            else evaled = await eval(evaled);
            embed
                .setTitle('Só suSEXO bb')
                .setColor('green')
                .setDescription(filtrar(evaled), 'js');
        } catch (e) {
            embed
                .setTitle('Ih deu merda viado')
                .setColor('red')
                .setDescription(filtrar(e), 'js');
            canReturn = true
        } finally {
            if (canReturn) return this.ket.send({ ctx, content: { embeds: [embed.build()] } });
        }
    }
}