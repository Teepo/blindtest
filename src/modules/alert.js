import Noty from 'noty';

class AlertManager {

    /**
     * @param {String} str
     * @param {String} type
     * @param {Player} player
     *
     */
    add({ str, type = 'info', player }) {

        if (player) {
            str = `<img src="assets/avatars/${player.customData.avatar}" width="32"> ${str}`;
        }

        (new Noty({
            theme     : 'metroui',
            type      : type,
            text      : str,
            layout    : 'topLeft',
            closeWith : ['click', 'button'],
            timeout   : 3000
        })).show();
    }
}

export const Alert = new AlertManager;