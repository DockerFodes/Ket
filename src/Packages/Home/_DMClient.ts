import { Message, GuildTextableChannel, CommandInteraction, PrivateChannel } from "eris";
import KetClient from "../../Main";
import { DEVS, guilds } from "../../JSON/settings.json";
import KetUtils from "../../Components/Core/KetUtils";
import { getColor } from "../../Components/Commands/CommandStructure";
import moment from 'moment';

export default async (ctx: Message<any> | CommandInteraction<any>, ket: KetClient, sendDM: boolean = false) => {
    if (ctx instanceof Message && !ctx.editedTimestamp && !ctx.author.bot) {

        // if (ctx.content.match(/((?:discord\.gg|discordapp\.com\/invite|discord\.com\/invite))/g)) {

        //     const invite = ctx.content.trim().split(' ').find((invite: string) => invite.includes('discord.gg'))
        //         .replace('https:', '')
        //         .replace(/((?:discord\.gg|discordapp\.com\/invite|discord\.com\/invite))/g, '')
        //         .replace(/(\/)/g, ''),
        //         guildData = await ket.getInvite(invite);

        //     ket.send({
        //         ctx: ctx.channel.id, content: 'vá divulgar servidor na casa do caralho seu pau no cu'
        //     });
        // }

        return sendDM ? sendMessageDM(ctx, ket) : DM(ctx, ket);
    }
}

async function DM(ctx: Message<PrivateChannel>, ket: KetClient) {
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

    const utils = new (KetUtils)(ket),
        ref = ctx.messageReference ? await ket.findMessage(ctx, { id: ctx.messageReference.messageID }) : null;

    return ket.executeWebhook(webhook.id, webhook.token, {
        username: ctx.author.username,
        avatarURL: ctx.author.dynamicAvatarURL('png'),
        content: ctx.content || '_ _',
        embeds: ref ? [{
            author: { name: ref.author.username, icon_url: ref.author.dynamicAvatarURL('jpg') },
            color: getColor('green'),
            description: ref.content,
            thumbnail: ref.attachments[0] ? { url: ref.attachments[0].url } : null,
            timestamp: moment(ref.timestamp).format()
        }] : null,
        file: [...(await utils.getMediaBuffer(ctx, 0)), ...(await utils.getMediaBuffer(ctx, 1))]
    })
        .catch((e) => ket.send({ ctx: channel.id, content: `Não foi possível \`receber\` uma mensagem (id: ${ctx.id})\n\n\`\`\`js\n${e}\`\`\``, emoji: 'negado' }))

}

async function sendMessageDM(ctx: Message<GuildTextableChannel>, ket: KetClient) {
    if (!DEVS.includes(ctx.author.id) || ctx.author.bot || ctx.content.startsWith(';')) return;
    let DMChannel = (await (await ket.findUser(ctx.channel.topic)).getDMChannel());

    if (!DMChannel) return;
    const utils = new (KetUtils)(ket),
        ref = ctx.messageReference ? await ket.findMessage(ctx.channel, { id: ctx.messageReference.messageID }) : null,
        DMRef = ref ? await ket.findMessage(DMChannel, { content: ref.content, limit: 25 }) : null;

    return ket.send({
        ctx: ctx.channel.topic, embed: false, content: {
            content: !ctx.content && !ctx.attachments && !ctx.stickerItems ? '_ _' : ctx.content,
            messageReference: DMRef ? {
                messageID: DMRef.id,
                channelID: DMChannel.id,
                failIfNotExists: false
            } : null,
            files: [...(await utils.getMediaBuffer(ctx, 0)), ...(await utils.getMediaBuffer(ctx, 1))]
        }
    })
        .catch((e) => ket.send({ ctx, content: `Não foi possível \`enviar\` a mensagem\n\n\`\`\`js\n${e}\`\`\``, emoji: 'negado' }))
}