export { };
import { SlashCommandBuilder } from "@discordjs/builders";
import { inspect } from "util";

const
    axios = require('axios'),
    c = require('chalk'),
    cld = require('child_process'),
    Eris = require('eris'),
    fs = require('fs'),
    gradient = require("gradient-string"),
    moment = require("moment"),
    path = require('path'),
    prompts = require('prompts'),
    CommandBuilder = SlashCommandBuilder,
    { CommandStructure, EmbedBuilder, Decoration } = require("../../components/Commands/CommandStructure"),
    { getEmoji, getColor } = Decoration;

module.exports = class EvalCommand extends CommandStructure {
    constructor(ket) {
        super(ket, {
            name: 'eval',
            aliases: ['e'],
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
            dontType: true,
            testCommand: ['message.channel.createMessage("alow")'],
            data: new SlashCommandBuilder().addStringOption(option =>
                option.setName("code")
                    .setDescription("Some code.")
                    .setRequired(true)
            )
        })
    }
    async execute(ctx) {
        const
            ket = this.ket,
            db = global.session.db;
        let
            message = ctx.env,
            evaled = ctx.args.join(" ")
                .replace('```js', '')
                .replace('```', '')
                .replace(/val /g, 'global.'),
            canReturn = (ctx.commandName === 'eval' ? true : false),
            embed: typeof EmbedBuilder = new EmbedBuilder(),
            mb = (data) => Math.floor(data / 1024 / 1024) + "MB"; 

        try {
            if (ctx.args.join(' ').includes('await')) evaled = await eval(`async function bah() {${evaled}};bah()`);
            else evaled = await eval(evaled);

            embed
                .setTitle('Só suSEXO bb')
                .setColor('green')
                .setDescription(inspect(evaled), 'js');
        } catch (e) {
            embed
                .setTitle('Ih deu merda viado')
                .setColor('red')
                .setDescription(inspect(e), 'js');
            canReturn = true
        } finally {
            if (canReturn) return ket.send({ context: ctx.env, content: { embeds: [embed.build()] } })
        }
    }
}