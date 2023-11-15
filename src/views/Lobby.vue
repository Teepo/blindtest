<template>
    <v-container class="mt-16">
        <v-container v-for="(player, index) in players.toArray()" :key="index">
            <v-card :theme="player.isReady ? 'is-ready' : 'is-not-ready'" >
                <v-card-item>
                    <v-card-text>
                        <v-row class="align-center">

                            <v-col cols="8">
                                <v-row class="align-center">
                                    <img :src="`src/assets/avatars/${player.customData.avatar}`" class="mr-4" :width="64" @click="showOverlayPlayerAvatar(player)">
                                    <strong class="font-weight-bold">
                                        {{ player.login }}
                                    </strong>
                                </v-row>
                            </v-col>

                            <v-col cols="4" class="player-list-status">
                                <v-checkbox-btn
                                    v-if="this.id == player.id"
                                    @click="setPlayerReadyHandler"
                                    :model-value="player.isReady"
                                    label="I'm ready"
                                    ></v-checkbox-btn>
                                <template v-else>
                                    <v-icon v-if="player.isReady" icon="mdi-check" color="green-lighten-1"></v-icon>
                                    <v-icon v-else icon="mdi-close" color="red-lighten-1"></v-icon>
                                </template>
                            </v-col>

                        </v-row>
                    </v-card-text>
                </v-card-item>
            </v-card>

            <v-dialog
                v-if="player.id == this.id"
                v-model="this.shouldDisplayOverlayPlayerAvatar[player.id]"
                contained
                class="align-center justify-center"
            >
                <v-card>
                    <v-card-item>
                        <v-card-text>
                            <template v-for="(index, image) in this.playerAvatars" :key="index">
                                <img :src="image" :width="32" @click="selectAvatar(player, getFileNameAndExtension(image))">
                            </template>
                        </v-card-text>
                    </v-card-item>
                </v-card>
            </v-dialog>
        </v-container>

        <v-container>
            <v-btn class="bg-red mt-10" block @click="leaveTheRoom">LEAVE THE ROOM</v-btn>
        </v-container>
    </v-container>
</template>

<script>

import { getFileNameAndExtension } from './../utils/string';

import { socket } from './../modules/ws.js';

export default {

    props: ['_player', '_players'],

    setup() {
        return { getFileNameAndExtension };
    },

    data() {

        return {
            player  : null,
            players : new Map,
            
            playerAvatars : [],

            shouldDisplayOverlayPlayerAvatar : [],
        }
    },

    async created() {

        const images = [];

        const avatars = import.meta.glob('./../assets/avatars/*');
        for (const path in avatars) {
            images.push(`./assets/avatars/${getFileNameAndExtension(path)}`)
        }

        this.playerAvatars = images;
    },
    
    async mounted() {

        this.id   = sessionStorage.getItem('id');
        this.room = sessionStorage.getItem('room');

        if (!this.id || !this.room) {
            socket.removeAllListeners();
            this.$router.push({ name: 'home' })
            return;
        }

        socket.emit('getPlayer', {
            id       : this.id,
            roomName : this.room
        });

        socket.emit('getAllPlayersFromRoom', {
            roomName : this.room
        });

        socket.on('start', this.wsOnStart);
        socket.on('getPlayer', this.wsOnGetPlayer);
        socket.on('getAllPlayersFromRoom', this.wsOnGetAllPlayersFromRoom);
        socket.on('updatedPlayer', this.wsOnGetAllPlayersFromRoom);
        socket.on('joinedRoom', this.wsOnJoinedRoom);
        socket.on('setPlayerIsReady', this.wsOnSetPlayerIsReady);
        socket.on('leavedRoom', this.wsOnLeavedRoom);
        socket.on('deletedPlayer', this.wsOnDeletedPlayer);
    },

    methods : {

        back() {

            sessionStorage.clear();

            this.$router.push({ name: 'home' });
        },

        leaveTheRoom() {

            socket.removeAllListeners();

            socket.emit('leaveRoom', {
                id       : this.id,
                roomName : this.room
            });

            this.back();
        },

        setPlayerReadyHandler() {

            socket.emit('setPlayerIsReady', {
                player   : this.player,
                roomName : this.room
            });

            this.player.isReady = !this.player.isReady;
        },

        showOverlayPlayerAvatar(player) {

            if (this.id !== player.id) {
                return;
            }

            this.shouldDisplayOverlayPlayerAvatar[player.id] = true;
        },

        selectAvatar(player, avatarName) {

            player.customData.avatar = avatarName;

            if (this.id !== player.id) {
                return;
            }

            socket.emit('updatePlayer', {
                roomName : this.room,
                player   : player
            });

            this.shouldDisplayOverlayPlayerAvatar[player.id] = false;
        },

        /*****************************************
         * 
         *             WS HANDLER
         * 
         *****************************************/

         wsOnStart() {
            
            socket.removeAllListeners();

            this.sceneManager.stop('lobby');
            this.sceneManager.start('multiPlayer', {
                players : this.players,
                mode    : this.mode
            });
         },

         wsOnGetPlayer(data) {

            const { player } = data;
            
            this.player = player;
        },

         wsOnGetAllPlayersFromRoom(data) {
            
            const { players } = data;

            players.map(player => {
                this.players.set(player.id, player);
            });
         },

         wsOnUpdatedPlayer() {
            const { player } = data;
            this.players.set(player.id, player);
         },
         
         wsOnJoinedRoom(data) {

            const { player } = data;
			this.players.set(player.id, player);
         },
         
         wsOnSetPlayerIsReady(data) {

            const { player } = data;

            this.players.get(player.id).isReady = player.isReady;
         },
         
         wsOnLeavedRoom(data) {

            const { id } = data;
            this.players.delete(id);
         },
         
         wsOnDeletedPlayer(data) {

            const { id } = data;

            // kick mode
            if (this.id === id) {
                socket.removeAllListeners();
                return this.back();
            }

            this.players.delete(id);
         },
    }
}
</script>

<style lang="scss">
    .player-list {

        display: none;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        flex-wrap: wrap;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        &--is-visible {
            display: flex;
        }

        &-status {
            display: flex;
            justify-content: end;
        }
    }

    .v-card {

        &-item {
            height: 60px;

            .v-checkbox-btn {

                flex: initial;

                .v-label {
                    white-space: nowrap;
                }
            }
        }

        &.v-theme {

            &--is-ready {
                border: 2px solid rgb(var(--v-theme-green-lighten-1));
            }

            &--is-not-ready {
                border: 2px solid rgb(var(--v-theme-red-lighten-1));
            }
        }
    }

    .v-overlay {

        .v-card {

            &-item {
                height: auto;
            }

            &-text {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                gap: 20px;
                justify-content: center;
            }
        }
    }

    .v-col .v-label {
        font-size: .85rem;
    }
</style>