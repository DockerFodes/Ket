import KetClient from "../../KetClient";

export default async (context, ket: KetClient) => {
    // if (message.content.match(/((?:discord\.gg|discordapp\.com\/invite|discord\.com\/invite))/g)) {
    //     const dmChannel = await message.author.getDMChannel();
    //     const invite = message.content.trim().split(' ').find((invite: string) => invite.includes('discord.gg'))
    //         .replace('https:', '')
    //         .replace(/((?:discord\.gg|discordapp\.com\/invite|discord\.com\/invite))/g, '')
    //         .replace(/(\/)/g, '');
    //     const serverData = await ket.getInvite(invite);
    //     console.log(serverData);
    //     dmChannel.createMessage({ embeds: [{}] });
    // }
    return;
}