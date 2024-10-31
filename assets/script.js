
const RAPID_API_KEY = "c4ff79442amsh30e5357ef2a421ep1190ccjsnc0974c03e6f6"; // Need to get key from https://rapidapi.com/streaming-availability/api/streaming-availability
// Professor Mantas ok to expose API key in this code for this project only

const client = new streamingAvailability.Client(new streamingAvailability.Configuration({
    apiKey: RAPID_API_KEY
}));

let searchResult = await client.showsApi.searchShowsByFilters(({
    country: "us",
    catalogs: ["netflix"],
    genres: ["action"],
    showType: streamingAvailability.ShowType.Movie,
    orderBy: "popularity_1year",
}));

searchResult.shows.forEach((show) => {
    console.log(show.title);
    console.log(show.overview);
    show.streamingOptions["us"].forEach((streamingOption) => {
        if(streamingOption.service.id === "netflix") {
            console.log(streamingOption.link);
        }
    });
});