export { }
const
    axios = require('axios'),
    bytes = require('bytes'),
    Canvas = require('canvas'),
    c = require('chalk'),
    cld = require('child_process'),
    eris = require('eris'),
    fs = require('fs'),
    gradient = require("gradient-string"),
    moment = require("moment"),
    path = require('path'),
    prompts = require('prompts'),
    util = require("util"),
    { CommandStructure, EmbedBuilder, Decoration } = require("../../components/CommandStructure"),
    Deco = new Decoration(),
    emoji = Deco.emojis,
    colors = Deco.colors,
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
        const ket = this.ket
        let
            evaled = args.join(" ").replace('```js', '').replace('```', ''),
            embed,
            msg;
        if (!message.editedTimestamp) msg = await message.channel.createMessage({ content: emoji('carregando') }).catch(() => { });
        else msg = await ket.editMessage(global.client.evalMessage.channelID, global.client.evalMessage.messageID, { content: emoji('carregando'), embeds: [], components: [] }).catch(() => { });
        try {
            if (args.includes('await')) evaled = await eval(`async function executeEval() {\n${evaled}\n}\nexecuteEval()`)
            else evaled = await eval(evaled)

            if (command === 'eval') {
                embed = new EmbedBuilder()
                    .setTitle('Só sucexo bb')
                    .setColor('green')
                    .setDescription(util.inspect(evaled), 'js')
            };
        } catch (e) {
            embed = new EmbedBuilder()
                .setTitle('Ih deu merda viado')
                .setColor('red')
                .setDescription(util.inspect(e), 'js')
        } finally {
            msg.edit(embed.build()).catch(() => { });
            return global.client.evalMessage = {
                messageID: msg.id,
                channelID: msg.channel.id
            }
        }

    }
}