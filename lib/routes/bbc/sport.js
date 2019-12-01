const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    let feed, title, link;
    let channel = ctx.params.channel.toLowerCase();
    try {
        feed = await parser.parseURL(`https://feeds.bbci.co.uk/sport/${channel}/rss.xml`);
        title = `BBC SPORT ${channel}`;
        link = `https://www.bbc.co.uk/sport/${channel}`;
    } catch (error) {
        ctx.state.data = {
            title: `BBC SPORT ${channel} doesn't exist`,
            description: `BBC SPORT ${channel} doesn't exist`,
        };
        return;
    }

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
        description: title,
        item: items,
    };
};
