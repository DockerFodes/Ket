import { Client, Message } from "eris"

const { EmbedBuilder } = require("../../components/Commands/CommandStructure");
module.exports = async (message: Message, ket: Client) => {
    if ((/((?:discord\.gg|discordapp\.com\/invite|discord\.com\/invite))/g).test(message.content)) {
        const userDM = await message.author.getDMChannel();
        const invite = message.content.trim().split(' ').find((invite: string) => invite.includes('discord.gg'))
            .replace('https:', '')
            .replace(/((?:discord\.gg|discordapp\.com\/invite|discord\.com\/invite))/g, '')
            .replace(/(\/)/g, '');
        const serverData = await ket.getInvite(invite);
        const embed = new EmbedBuilder();
        embed.setColor('pink');
        embed.setAuthor(message.author.username, message.author.avatarURL);
        embed.setThumbnail(serverData.guild.iconURL);
        embed.setDescription("batata");
        userDM.createMessage({ embed: embed.build() });
    }
    return;
}