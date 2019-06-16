const _ = require('underscore');
const fetch = require('node-fetch');
const config = require('config');

const baseurl = "https://api.tumblr.com/v2/blog/";
const identifier = config.get('Blog.identifier');
const apiKey = config.get('Blog.apiKey');
const moment = require('moment');
const fs = require('fs');
const performance = require('performance-now');

let targetPosts = [];

const fetchBlog = async() => {
    const response = await fetch(`${baseurl}${identifier}/info?api_key=${apiKey}`);
    const json = await response.json();
    const blog = json['response']['blog'];
    console.log(`title: ${blog['title']}`);
    console.log(`posts: ${blog['posts']}`);
    console.log(`url: ${blog['url']}`);
}

const getPostCount = async() => {
    const response = await fetch(`${baseurl}${identifier}/info?api_key=${apiKey}`);
    const json = await response.json();
    const count = json['response']['blog']['posts'];
    return parseInt(count);
}

const fetchPosts = async(type, offset, minCount = 0) => {
    const response = await fetch(`${baseurl}${identifier}/posts/${type}?notes_info=true&reblog_info=true&offset=${offset}&api_key=${apiKey}`);
    const json = await response.json();
    process.stdout.write('\r' + offset);
    _.each(json['response']['posts'], (post) => {
        if (!post['reblogged_root_name'] && parseInt(post['note_count']) >= minCount) {
            const postInfo = {
                url: `'https://${identifier}/post/${post['id']}'`,
                date: `'${post['date']}'`,
                type: `'${post['type']}'`,
                slug: `'${post['slug']}'`,
                count: `'${post['note_count']}'`
            };
            targetPosts.push(postInfo)
        }
    })
}

const output = (path, data) => {
    fs.writeFile(path, data, (err) => {
        if (err) { throw err; }
    });
}

const fetchMyPosts = async() => {
    await fetchBlog();
    const count = await getPostCount();
    let offset = 0;
    const start_ms = performance();
    let tasks = [];
    while (offset <= count) {
        tasks.push(fetchPosts('', offset, 2));
        offset += 20;
    }
    await Promise.all(tasks);
    console.log('\n' + (performance() - start_ms).toFixed(3) + ' elapsed.');
    const fileName = 'tumblr-score-' + moment().format("YYYYMMDDHHmmss");
    let csv = ''
    targetPosts.sort((a, b) => {
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
        return 0;
    });
    _.each(targetPosts, (post) => { csv += `${post.url},${post.date},${post.type},${post.slug},${post.count}\n` });
    output(`work/${fileName}.csv`, csv);
    output(`work/${fileName}.json`, JSON.stringify(targetPosts, null, 2));
}

fetchMyPosts();
