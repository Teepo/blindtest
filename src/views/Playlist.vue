<script setup>

    const playlists = import.meta.glob('./../../data/playlist/*.json', { as: 'json', eager: true });

    console.log(playlists)
</script>

<template>
    <v-container fluid>
        <v-responsive>

            <v-row>
                <v-col cols="6" sm="3" md="3" v-for="playlist, k in playlists" :key="k">
                    <PlaylistCard :item="playlist"></PlaylistCard>
                </v-col>
            </v-row>

        </v-responsive>
    </v-container>
</template>

<script>

import PlaylistCard from './../components/PlaylistCard.vue';

export default {
    components: { PlaylistCard },
}
</script>
