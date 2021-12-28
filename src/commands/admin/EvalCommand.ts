export { };
import Eris from "eris"
const
    axios = require('axios'),
    bytes = require('bytes'),
    Canvas = require('canvas'),
    c = require('chalk'),
    cld = require('child_process'),
    fs = require('fs'),
    gradient = require("gradient-string"),
    moment = require("moment"),
    path = require('path'),
    prompts = require('prompts'),
    util = require("util"),
    { CommandStructure, EmbedBuilder, Decoration } = require("../../components/Commands/CommandStructure"),
    { getEmoji, getColor } = Decoration;

module.exports = class EvalCommand extends CommandStructure {
    constructor(ket: Eris.Client) {
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
            dontType: false,
            testCommand: ['message.channel.createMessage("alow")'],
            slashData: null
        })
    }
    async execute({ context, args, commandName }, t) {
        const
            ket = this.ket,
            db = global.session.db;

        let
            message = (context instanceof Eris.Message ? context : context.message),
            evaled = args.join(" ").replace('```js', '').replace('```', ''),
            canReturn = (commandName === 'eval' ? true : false),
            embed: typeof EmbedBuilder;

        try {
            if (args.includes('await')) evaled = await eval(`async function executeEval() {\n${evaled}\n}\nexecuteEval()`);
            else evaled = await eval(evaled);

            embed = new EmbedBuilder()
                .setTitle('Só sucexo bb')
                .setColor('green')
                .setDescription(util.inspect(evaled), 'js');
        } catch (e) {
            embed = new EmbedBuilder()
                .setTitle('Ih deu merda viado')
                .setColor('red')
                .setDescription(util.inspect(e), 'js');
            canReturn = true
        } finally {
            if (canReturn) ket.say({ context, content: { embeds: [embed.build()] } })
        }
    }
}