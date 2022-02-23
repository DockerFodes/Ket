import KetClient from "../Main";
import Prisma from "../Components/Database/PrismaConnection";
import { ESMap } from "typescript";
import { globalchat } from "../JSON/settings.json";
import { GuildChannel, GuildTextableChannel, Webhook, WebhookData } from "eris";

module.exports = class Event {
    ket: KetClient;
    prisma: Prisma;
    constructor(ket: KetClient, prisma: Prisma) {
        this.ket = ket;
        this.prisma = prisma;
    }
    async on(wData: WebhookData) {
        if ((await this.prisma.servers.findMany({ where: { globalchat: wData.channelID } }))[0]) {
            let data = this.ket.webhooks.get(wData.channelID),
                guild = this.ket.guilds.get(wData.guildID),
                channel: any = guild?.channels?.get(wData.channelID);

            if (!guild || !channel || !channel.permissionsOf(this.ket.user.id).has('manageWebhooks')) return;
            let webhooks = (await channel.getWebhooks()).filter((w: Webhook) => w.name === globalchat.webhookName && w.user.id === this.ket.user.id);
            let webhook = webhooks[0]

            if (!webhook)
                return webhook = await this.ket.createChannelWebhook(wData.channelID, { name: globalchat.webhookName })
                    .then((w) => this.ket.webhooks.set(wData.channelID, w))
                    .catch(() => { })

            if (data && (webhook.name !== globalchat.webhookName || webhook?.channel_id !== data.channel_id))
                return this.ket.editWebhook(webhook.id, {
                    name: globalchat.webhookName,
                    channelID: wData.channelID
                }, webhook.token)
        }
    }
}