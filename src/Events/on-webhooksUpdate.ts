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
    async on(_webhookData: WebhookData, channelID: string, guildID: string) {
        if (await this.prisma.servers.find({ where: { globalchat: channelID } })) {
            let data = this.ket.webhooks.get(channelID),
                guild = this.ket.guilds.get(guildID),
                channel: any = guild?.channels?.get(channelID);

            if (!guild || !channel || !channel.permissionsOf(this.ket.user.id).has('manageWebhooks')) return;
            let webhooks = (await channel.getWebhooks()).filter((w: Webhook) => w.name === globalchat.webhookName && w.user.id === this.ket.user.id);
            let webhook = webhooks[0]

            if (!webhook)
                return webhook = await this.ket.createChannelWebhook(channelID, { name: globalchat.webhookName })
                    .then((w) => this.ket.webhooks.set(channelID, w))
                    .catch(() => { })

            if (webhook.name !== globalchat.webhookName || webhook.channel_id !== data.channel_id)
                return this.ket.editWebhook(webhook.id, {
                    name: globalchat.webhookName,
                    channelID: channelID
                }, webhook.token)
        }
    }
}