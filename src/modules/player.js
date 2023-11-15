export class Player {

    /**
     * @param {String} id
     * @param {String} login
     * @param {String} avatar
     *
     */
    constructor({ id, login, avatar }) {

        this.id      = id;
        this.login   = login;
        this.isReady = false;

        this.customData = {
            avatar : avatar,
            score  : 0,
        };
    }
}