const cheerio = require('cheerio');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (ctx) => {
    const feed = await parser.parseURL('http://www.wpbsa.com/feed/');

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);
        $('p').last().remove();
        return $.html();
    };

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const single = {
                guid: item.guid,
                title: item.title,
                description: `<h1>${item.title}</h1>${ProcessFeed(item['content:encoded'])}`,
                pubDate: item.pubDate,
                link: item.link,
                author: item['dc:creator'],
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: feed.title,
        image: 'https://wpbsa.com/wp-content/uploads/2016/03/wpbsa.png',
        link: feed.link,
        description: feed.description,
        item: items,
    };
};