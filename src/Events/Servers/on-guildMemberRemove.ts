import Event from "../../Components/Classes/Event";

module.exports = class guildMemberRemove extends Event {
    public disabled = true;
    public dir = __filename;

    public async on() {
        return;
    }
}