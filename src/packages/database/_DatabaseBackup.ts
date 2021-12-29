module.exports = (ket: any) => {
    setTimeout(() => {
        let db = global.session.db;
        ket.createMessage(ket.config.channels.database, '', { file: '', filename: ''})
    }, 60_000 * 30)
}