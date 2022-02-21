import KetClient from "../../Main";

export default async (context, ket: KetClient) => {
    // if (context.content.match(/((?:discord\.gg|discordapp\.com\/invite|discord\.com\/invite))/g)) {

    //     const invite = context.content.trim().split(' ').find((invite: string) => invite.includes('discord.gg'))
    //         .replace('https:', '')
    //         .replace(/((?:discord\.gg|discordapp\.com\/invite|discord\.com\/invite))/g, '')
    //         .replace(/(\/)/g, '');
    //     const serverData = await ket.getInvite(invite);
    //     console.log(serverData);
    //     ket.send({
    //         ctx: context.channel.id, content: {
    //             embeds: [{}]
    //         }
    //     });
    // }
    // return;
}