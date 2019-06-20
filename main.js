const fetch = require('node-fetch');
const config = require('config');

const baseurl = "https://api.tumblr.com/v2/blog/";
const identifier = process.env.BLOG_IDENTIFIER ? process.env.BLOG_IDENTIFIER : config.get('Blog.identifier');
const apiKey = process.env.BLOG_API_KEY ? process.env.BLOG_API_KEY : config.get('Blog.apiKey');

if (!apiKey || !identifier) {
    console.error("API Key or blog identifier not set.");
    process.exit(1);
}
const fs = require('fs');
const performance = require('performance-now');

let targetPosts = [];

const fetchCount = async () => {
    const response = await fetch(`${baseurl}${identifier}/info?api_key=${apiKey}`);
    const json = await response.json();
    const blog = json['response']['blog'];
    if (!blog) {
        console.error("error");
        process.exit(1);
    }
    console.log(`title: ${blog['title']}`);
    console.log(`url: ${blog['url']}`);
    const count = blog['posts'];
    console.log(`posts: ${count}`);
    return parseInt(count);
}

const getDateString = () => {
    let date = new Date()
    const options = {
        year: "numeric", month: "numeric", day: "numeric",
        hour: "numeric", minute: "numeric", second: "numeric",
        hour12: false
    };
    return date.toLocaleString("ja-JP", options);
}

const fetchPosts = async (type, offset, minCount = 0) => {
    const response = await fetch(`${baseurl}${identifier}/posts/${type}?notes_info=true&reblog_info=true&offset=${offset}&api_key=${apiKey}`);
    const json = await response.json();
    process.stdout.write('\r' + offset);
    const posts = json['response']['posts'];
    if (!posts) return;
    posts.forEach(post => {
        if (!post['reblogged_root_name'] && parseInt(post['note_count']) >= minCount) {
            const postInfo = {
                url: `'https://${identifier}/post/${post['id']}'`,
                date: `'${post['date']}'`,
                type: `'${post['type']}'`,
                slug: `'${post['slug']}'`,
                count: parseInt(post['note_count'], 10)
            };
            targetPosts.push(postInfo)
        }
    });
}

const output = (path, data) => {
    fs.writeFile(path, data, err => {
        if (err) { throw err; }
    });
}

const append = (path, data) => {
    fs.appendFile(path, data, err => {
        if (err) { throw err; }
    });
}

const fetchMyPosts = async () => {
    const count = await fetchCount();
    let offset = 0;
    const start_ms = performance();
    let tasks = [];
    while (offset <= count) {
        tasks.push(fetchPosts('', offset, 1));
        offset += 20;
    }
    await Promise.all(tasks);
    console.log('\n' + (performance() - start_ms).toFixed(3) + ' elapsed.');
    targetPosts.sort((a, b) => {
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
        return 0;
    });
    output("public/tumblr-score.json", JSON.stringify(targetPosts, null, 2));
    const total = targetPosts.reduce((a, c) => {
        return { count: a.count + c.count };
    });
    append("public/summary.txt", `${getDateString()},${count},${total.count}\r`);
}

fetchMyPosts();
