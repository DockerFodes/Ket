const
    Eris = require('eris');

module.exports = class InteractionCreate {
    ket: any;
    constructor(ket) {
        this.ket = ket;
    }
    async start(interaction) {
        if (!(interaction instanceof Eris.CommandInteraction)) return;
        if (interaction.data.name === 'teste')
            return interaction.createMessage('sexo');
    }
}