const cheerio = require('cheerio');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (ctx) => {
    const feed = await parser.parseURL('http://www.worldsnooker.com/feed/');

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);
        $('p').last().remove();
        $('div').removeAttr('style');
        $('img').removeAttr('width');
        $('img').removeAttr('height');
        $('img').removeAttr('sizes');
        $('img').removeAttr('srcset');
        return $.html();
    };

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const single = {
                guid: item.guid,
                title: item.title,
                description: ProcessFeed(item['content:encoded']),
                pubDate: item.pubDate,
                link: item.link,
                author: item['dc:creator'],
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: feed.title,
        image: 'http://cdn.taiqiuapp.com/image/profile_image/75631198882238465_vsnDcaTFCFSVdUctR.png',
        link: feed.link,
        description: feed.description,
        item: items,
    };
};