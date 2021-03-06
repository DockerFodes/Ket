import { GuildChannel, WebhookData } from "eris";
import Event from "../../Components/Classes/Event";

module.exports = class webhooksUpdate extends Event {
    public dir = __filename;

    public async on(wData: WebhookData) {
        if (!(await this.postgres.servers.find(wData.channelID, false, 'globalchat'))) return;

        let data = this.ket.webhooks.get(wData.channelID),
            guild = this.ket.guilds.get(wData.guildID),
            channel: GuildChannel = guild?.channels?.get(wData.channelID);

        if (!guild || !channel || !channel.permissionsOf(this.ket.user.id).has('manageWebhooks')) return;

        let webhooks = (await this.ket.getChannelWebhooks(wData.channelID))
            .filter((w) => w.user.id === this.ket.user.id);
        let webhook = webhooks[0];

        if (!webhooks[0]) {
            webhook = await this.ket.createChannelWebhook(wData.channelID, { name: 'Ket' })
            this.ket.webhooks.delete(wData.channelID);
            this.ket.webhooks.set(wData.channelID, webhook)
        }

        if (webhooks[1] && webhooks.shift())
            for (let i in webhooks) this.ket.deleteWebhook(webhooks[i].id);

        if (data && (webhook?.name !== 'Ket' || webhook?.channel_id !== data.channel_id))
            this.ket.editWebhook(webhook.id, {
                name: 'Ket',
                channelID: wData.channelID
            }, webhook.token)

        return;
    }
}