<template>
    <v-container class="fill-height">
        <v-responsive class="align-center text-center fill-height">

            <v-img height="300" src="@/assets/logo.svg" />

            <div class="py-14" />

            <v-row class="d-flex align-center justify-center">

                <v-col cols="auto">

                    <v-form @submit.prevent>
                        <v-text-field v-model="formJoinRoomInputValue" :rules="formJoinRoomRules" label="Player name">
                        </v-text-field>

                        <v-btn type="submit" color="primary" min-width="230" size="x-large" variant="flat" @click="joinRoom">
                            <v-icon icon="mdi-arrow-right-circle" size="large" start />
                            JOIN GAME
                        </v-btn>
                    </v-form>
                </v-col>
            </v-row>

        </v-responsive>
    </v-container>
</template>

<script>

import { ROOM_NAME } from './../config/index';

import { Player } from './../modules/player.js';

import { socket } from './../modules/ws.js';
import { wsErrorHandler } from './../modules/wsErrorHandler.js';

import { mergeObjectsWithPrototypes  } from './../utils/object.js';

export default {

	data() {

		return {

			formJoinRoomInputValue: '',
			formJoinRoomRules: [
				value => {
					if (value) return true
					return 'You must enter a room name.'
				},
			]
		}
	},

    async mounted() {

        this.restoreSessionIfNeeded();

        socket.on('joinedRoom', data => {

            const { socketId } = data;

            if (socket.id !== socketId) {
                return;
            }

            const error = wsErrorHandler(data);

            if (error) {
                return;
            }

            const { player } = data;

            let customPlayer = new Player({
                avatar : 'luchador.svg',
            });

            const newPlayer = mergeObjectsWithPrototypes(customPlayer, player);
            newPlayer.customData = customPlayer.customData;

            socket.emit('updatePlayer', {
                player   : newPlayer,
                roomName : ROOM_NAME
            });

            sessionStorage.setItem('id', player.id);
            sessionStorage.setItem('room', ROOM_NAME);

            socket.removeAllListeners();

            this.$router.push({ name: 'lobby' });
        });
    },

    methods: {
        
        joinRoom() {

            socket.emit('joinRoom', {
                roomName : ROOM_NAME,
                login    : this.formJoinRoomInputValue
            });
        },

        restoreSessionIfNeeded() {

            const id   = sessionStorage.getItem('id');
            const room = sessionStorage.getItem('room');

            if (!id || !room) {
                return;
            }

            socket.emit('getPlayer', {
                id       : id,
                roomName : room
            });

            socket.on('getPlayer', data => {

                const { player, error } = data;

                if (error) {
                    return;
                }

                if (!player.id) {
                    return;
                }

                socket.removeAllListeners();

                this.$router.push({ name: 'lobby' });
            });
        }
    },
}
</script>
