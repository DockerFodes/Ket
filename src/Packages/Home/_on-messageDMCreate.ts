import { GroupChannel, Message, GuildTextableChannel, CommandInteraction } from "eris";
import KetClient from "../../Main";
import { DEVS, guilds } from "../../JSON/settings.json";
import KetUtils from "../../Components/Core/KetUtils";

export default async (ctx: Message<any> | CommandInteraction<any>, ket: KetClient, sendDM: boolean = false) => {
    if (ctx instanceof Message && !ctx.editedTimestamp && !ctx.author.bot)
        return sendDM ? sendMessageDM(ctx, ket) : DM(ctx, ket);
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

async function DM(ctx: Message<GroupChannel>, ket: KetClient) {
    let guild = ket.guilds.get(guilds.devs),
        //@ts-ignore
        channel: GuildTextableChannel = guild?.channels.find(c => c.type === 0 && c.topic === ctx.author.id && c.parentID === guilds.dmCategory),
        webhook = channel ? (await ket.getChannelWebhooks(channel.id)).find(w => w.user.id === ket.user.id) : null;

    if (!guild) return;
    if (!channel)
        channel = await ket.createChannel(guilds.devs, ctx.author.username, 0, {
            parentID: guilds.dmCategory,
            topic: ctx.author.id
        });

    if (!webhook)
        webhook = await ket.createChannelWebhook(channel.id, { name: `DM Logs (${ctx.author.id})` });

    const utils = new (KetUtils)(ket);
    return ket.executeWebhook(webhook.id, webhook.token, {
        username: ctx.author.username,
        avatarURL: ctx.author.dynamicAvatarURL('png'),
        content: !ctx.content && !ctx.attachments && !ctx.stickerItems ? '_ _' : ctx.content,
        file: [...(await utils.getMediaBuffer(ctx, 0)), ...(await utils.getMediaBuffer(ctx, 1))]
    })
        .catch((e) => ket.send({ ctx: channel.id, content: `Não foi possível \`receber\` uma mensagem (id: ${ctx.id})\n\n\`\`\`js\n${e}\`\`\``, emoji: 'negado' }))

}

async function sendMessageDM(ctx: Message<GuildTextableChannel>, ket: KetClient) {
    if (!DEVS.includes(ctx.author.id) || ctx.author.bot || ctx.content.startsWith(';')) return;
    let user = await ket.findUser(ctx.channel.topic);

    if (!user) return;
    const utils = new (KetUtils)(ket);

    return ket.send({
        ctx: ctx.channel.topic, embed: false, content: {
            content: !ctx.content && !ctx.attachments && !ctx.stickerItems ? '_ _' : ctx.content,
            file: [...(await utils.getMediaBuffer(ctx, 0)), ...(await utils.getMediaBuffer(ctx, 1))]
        }
    })
        .catch((e) => ket.send({ ctx, content: `Não foi possível \`enviar\` a mensagem\n\n\`\`\`js\n${e}\`\`\``, emoji: 'negado' }))
}