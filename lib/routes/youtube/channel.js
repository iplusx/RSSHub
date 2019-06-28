const utils = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const embed = !ctx.params.embed;

    const item = (await utils.getChannelWithId(id, 'snippet,contentDetails')).data.items[0];
    const snippet = item.snippet;
    const playlistId = item.contentDetails.relatedPlaylists.uploads;
    const data = (await utils.getPlaylistItems(playlistId, 'snippet,contentDetails')).data.items;
    ctx.state.data = {
        title: `${snippet.title} 的 Youtube 视频`,
        link: `https://www.youtube.com/channel/${id}`,
        description: snippet.description,
        image: snippet.thumbnails.medium.url,
        item: data
            .filter((d) => d.snippet.title !== 'Private video' && d.snippet.title !== 'Deleted video')
            .map((item) => {
                const snippet = item.snippet;
                const videoId = snippet.resourceId.videoId;
                const img = utils.getThumbnail(snippet.thumbnails);
                return {
                    title: snippet.title,
                    description: `${
                        embed ? '<iframe id="ytplayer" type="text/html" width="640" height="360" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>' : ''
                    }${utils.formatDescription(snippet.description)}<img referrerpolicy="no-referrer" src="${img.url}">`,
                    pubDate: new Date(snippet.publishedAt).toUTCString(),
                    link: `https://www.youtube.com/watch?v=${videoId}`,
                };
            }),
    };
};
