module.exports = (ket: any) => {
    setTimeout(() => {
        let db = global.session.db;
        ket.createMessage(ket.config.channels.database, 'cu')
    }, 60_000 * 30)
}