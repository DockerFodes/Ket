const { EmbedBuilder } = require("../../components/CommandStructure");
module.exports = class MessageDMCreate {
    ket: any;
    constructor(ket) {
        this.ket = ket;
    }
    async start(message) {
        if ((/((?:discord\.gg|discordapp\.com\/invite|discord\.com\/invite))/g).test(message.content)) {
            const userDM = await message.author.getDMChannel();
            const invite = message.content.trim().split(' ').find(invite => invite.includes('discord.gg'))
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