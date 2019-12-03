const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const channel = ctx.params.channel;
    const feed = await parser.parseURL(`https://feeds.bbci.co.uk/sport/${channel}/rss.xml`);
    const title = `BBC SPORT ${channel.toUpperCase()}`;
    const link = `https://www.bbc.co.uk/sport/${channel}`;
    
    const items = await Promise.all(
        feed.items.splice(0, 10).map(async (item) => {
            const response = await got({
                method: 'get',
                url: item.link,
            });

            const $ = cheerio.load(response.data);

            let description;

            if (response.request.gotOptions.path.startsWith('/news/av')) {
                description = utils.ProcessAVFeed($, item.link);
            } else {
                description = utils.ProcessFeed($, item.link);
            }
            description = `<h1>${item.title}</h1>` + description;

            const single = {
                title: item.title,
                description,
                pubDate: item.pubDate,
                link: item.link,
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title,
        image: 'http://cdn.taiqiuapp.com/image/profile_image/bbc-sport.png',
        link,
        description: 'The home of Snooker on BBC Sport online. Includes the latest news stories, results, fixtures, video and audio.',
        item: items,
    };
};
