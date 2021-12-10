import Eris from "eris"
const { EmbedBuilder } = require("../../components/Commands/CommandStructure");
module.exports = class MessageDMCreate {
    ket: Eris.Client;
    constructor(ket: Eris.Client) {
        this.ket = ket;
    }
    async execute(message: Eris.Message) {
        if ((/((?:discord\.gg|discordapp\.com\/invite|discord\.com\/invite))/g).test(message.content)) {
            const userDM = await message.author.getDMChannel();
            const invite = message.content.trim().split(' ').find((invite: string) => invite.includes('discord.gg'))
                .replace('https:', '')
                .replace(/((?:discord\.gg|discordapp\.com\/invite|discord\.com\/invite))/g, '')
                .replace(/(\/)/g, '');
            const serverData = await this.ket.getInvite(invite);
            const embed = new EmbedBuilder();
            embed.setColor('pink');
            embed.setAuthor(message.author.username, message.author.avatarURL);
            embed.setThumbnail(serverData.guild.iconURL);
            embed.setDescription("batata");
            userDM.createMessage({embed: embed.build()});
        }
        return;
    }
}