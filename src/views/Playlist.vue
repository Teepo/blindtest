<template>
    <v-container fluid>
        <v-responsive>

            <div class="mb-10">

                <h1 class="text-h4 font-weight-bold mb-5">By thematic</h1>

                <v-row>
                    <v-slide-group show-arrows>
                        <v-slide-group-item v-for="n in 15" :key="n">
                            <PlaylistCard></PlaylistCard>
                        </v-slide-group-item>
                    </v-slide-group>
                </v-row>
            </div>

            <div class="mb-10">

                <h1 class="text-h4 font-weight-bold mb-5">Through the years</h1>

                <v-row>
                    <v-slide-group show-arrows>
                        <v-slide-group-item v-for="n in 15" :key="n">
                            <PlaylistCard></PlaylistCard>
                        </v-slide-group-item>
                    </v-slide-group>
                </v-row>
            </div>

            <div class="mb-10">

                <h1 class="text-h4 font-weight-bold mb-5">Choose your style</h1>

                <v-row>
                    <v-slide-group show-arrows>
                        <v-slide-group-item v-for="n in 15" :key="n">
                            <PlaylistCard></PlaylistCard>
                        </v-slide-group-item>
                    </v-slide-group>
                </v-row>
            </div>

        </v-responsive>
    </v-container>
</template>

<script>

import PlaylistCard from './../components/PlaylistCard.vue';

export default {

    components: { PlaylistCard },

	data() {

		return {
		}
	},

    async mounted() {
    },

    methods: {
    },
}
</script>
