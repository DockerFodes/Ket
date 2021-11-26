import { CommandStructure, EmbedBuilder } from "../../components/CommandStructure"
import util from "util"

export default class EvalCommand extends CommandStructure {
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
    async executeVanilla({message, args}) {
        const ket = this.ket
        let evaled, embed;

        try {
            if(args.includes('await')) evaled = await eval(`async function executeEval() {\n${args.join(" ")}\n}\nexecuteEval()`)
            else evaled = await eval(args.join(' '))    

            embed = new EmbedBuilder()
                .setTitle('Só sucexo bb')
                .setColor('green')
                .setDescription(util.inspect(evaled), 'js')
            message.channel.createMessage(embed.build())
        } catch(e) {
            embed = new EmbedBuilder()
                .setTitle('Ih deu merda viado')
                .setColor('red')
                .setDescription(util.inspect(e), 'js')
            message.channel.createMessage(embed.build())
        }

    }
}