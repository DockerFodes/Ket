export { };
const
    axios = require('axios'),
    bytes = require('bytes'),
    Canvas = require('canvas'),
    c = require('chalk'),
    cld = require('child_process'),
    Eris = require('eris'),
    fs = require('fs'),
    gradient = require("gradient-string"),
    moment = require("moment"),
    path = require('path'),
    prompts = require('prompts'),
    util = require("util"),
    { CommandStructure, EmbedBuilder, Decoration } = require("../../components/CommandStructure"),
    Deco = new Decoration(),
    emoji = Deco.getEmoji,
    getColor = Deco.getColor,
    db = global.client.db;

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
            testCommand: ['message.channel.createMessage("alow")'],
            slashData: null
        })
    }
    async execute({ message, args, command }, t) {
        const ket = this.ket;
        let
            evaled = args.join(" ").replace('```js', '').replace('```', ''),
            canReturn = (command === 'eval' ? true : false),
            embed;

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
            if (canReturn) message.reply({ embed: embed })
        }
    }
}