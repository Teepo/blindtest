<template>
    <v-container>
        <v-responsive>

            <v-row>
                <v-col>
                    <v-row class="align-start">
                        <v-col>
                            <h1 class="text-h4 font-weight-bold">By thematic</h1>
                        </v-col>

                        <v-row>
                            <v-col cols="6" sm="3" md="2" v-for="i of 4" :key="i">
                                <PlaylistCard></PlaylistCard>
                            </v-col>
                        </v-row>
                    </v-row>
                </v-col>
            </v-row>

            <v-row>
                <v-col>
                    <v-row class="align-start">
                        <v-col>
                            <h1 class="text-h4 font-weight-bold">Through the years</h1>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="6" sm="3" md="2" v-for="i of 4" :key="i">
                            <playlist-card></playlist-card>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>

            <v-row>
                <v-col>
                    <v-row class="align-start">
                        <v-col>
                            <h1 class="text-h4 font-weight-bold">Choose your style</h1>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="6" sm="3" md="2" v-for="i of 4" :key="i">
                            <playlist-card></playlist-card>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>

        </v-responsive>
    </v-container>
</template>

<script>

export default {

    components: {
        PlaylistCard: () => import("../components/PlaylistCard.vue")
    },

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
