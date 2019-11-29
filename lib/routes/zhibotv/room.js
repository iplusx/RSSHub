const got = require('@/utils/got');
const cheerio = require('cheerio');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `http://v.zhibo.tv/${id}`;

    const response = await got.get(link);
    const dom = new JSDOM(response.data, {
        runScripts: 'dangerously',
    });
    const isLive = dom.window.videoIsLive === '1';
    const name = dom.window.hostName.trim();
    const profileImageUrl =`http://www.zhibo.tv${dom.window.roomHead}`;

    let item = [];
    if (isLive) {
        const $ = cheerio.load(response.data);
        const roomTitle = $('.live_room .m-lgt .play_info dl dt p').text().trim();
        item = [
            {
                title: `【开播提醒】${roomTitle}`,
                description: `<p>${roomTitle}</p><a href="${link}">点击复制直播地址</a>`,
                pubDate: new Date().toUTCString(),
                guid: dom.window.rtmpPollUrl,
                link: link,
            },
        ];
    }

    ctx.state.data = {
        title: `${name} - 中国体育`,
        description: dom.window.roomNotice.trim(),
        image: profileImageUrl,
        link: `http://www.zhibo.tv/profile/${id}`,
        item: item,
        allowEmpty: true,
    };
};
