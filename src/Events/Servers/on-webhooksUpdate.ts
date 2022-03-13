import KetClient from "../../Main";
import { GuildChannel, Webhook, WebhookData } from "eris";

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
                channel: GuildChannel = guild?.channels?.get(wData.channelID);

            if (!guild || !channel || !channel.permissionsOf(this.ket.user.id).has('manageWebhooks')) return;
            let webhooks: Webhook[] = (await this.ket.getChannelWebhooks(wData.channelID)).filter((w: Webhook) => w.user.id === this.ket.user.id);
            let webhook: Webhook = webhooks[0];

            if (!webhooks[0]) {
                webhook = await this.ket.createChannelWebhook(wData.channelID, { name: 'Ket' })
                this.ket.webhooks.set(wData.channelID, webhook)
            }

            if (webhooks[1]) for (let i in webhooks) Number(i) === 0 ? null : this.ket.deleteWebhook(webhooks[i].id);

            if (data && (webhook?.name !== 'Ket' || webhook?.channel_id !== data.channel_id)) return this.ket.editWebhook(webhook.id, {
                name: 'Ket',
                channelID: wData.channelID
            }, webhook.token)
        }
        return;
    }
}