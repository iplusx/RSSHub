const cheerio = require('cheerio');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (ctx) => {
    const feed = await parser.parseURL('http://www.snookerbacker.com/feed/');

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);
        $.prototype.unwrap = function () {
            this.replaceWith(this.html());
        }
        $('p').map((_, item) => {
            item = $(item);
            if (item.text().trim() === '') {
                item.remove();
            }
            item.find('span').unwrap();
            item.find('strong').unwrap();
            item.find('em').unwrap();
            const a = item.find('a').first();
            if (a && a.attr('href') && a.attr('href').toLowerCase().indexOf('parriscues') > -1) {
                item.remove();
            }
        })
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
        image: 'http://cdn.taiqiuapp.com/image/profile_image/117014230339686401_GztKlxxY7qUaK.png',
        link: feed.link,
        description: feed.description,
        item: items,
    };
};