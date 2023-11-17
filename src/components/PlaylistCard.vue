<template>
    <v-card class="playlist-card flex d-flex flex-column">

        <v-img v-if="item?.cover" :src="item.cover" />

        <v-card-title class="text-h6 font-weight-bold ma-0" v-if="item.title">
            {{ item.title }}
        </v-card-title>

        <v-card-text class="flex font-weight-light mb-4" v-if="item.subtitle">
            {{ item.subtitle }}
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: "PlaylistCard",
    props: {
        item: Object
    }
};
</script>