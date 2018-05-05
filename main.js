const _ = require('underscore');
const fetch = require('node-fetch');
const ProgressBar = require('progress');
const config = require('config');

const baseurl = "https://api.tumblr.com/v2/blog/";
const identifier = config.get('Blog.identifier');
const apiKey = config.get('Blog.apiKey');

let targetPosts = [];

const fetchBlog = async() => {
    await fetch(`${baseurl}${identifier}/info?api_key=${apiKey}`).then(response => response.json()).then(json => {
        var blog = json['response']['blog'];
        console.log(`title: ${blog['title']}`);
        console.log(`posts: ${blog['posts']}`);
        console.log(`url: ${blog['url']}`);
    });
}

const getPostCount = async() => {
    var count = await fetch(`${baseurl}${identifier}/info?api_key=${apiKey}`)
        .then(response => response.json()).then(json => {
            return json['response']['blog']['posts'];
        });
    return parseInt(count);
}

const fetchPosts = async(type, offset, minCount = 0) => {
    await fetch(`${baseurl}${identifier}/posts/${type}?notes_info=true&reblog_info=true&offset=${offset}&api_key=${apiKey}`)
        .then(response => response.json()).then(json => {
            _.each(json['response']['posts'], function(post) {
                if (!post['reblogged_root_name'] && parseInt(post['note_count']) >= minCount) {
                    var postInfo = {
                        url: `'http://reblog.kondoumh.com/post/${post['id']}'`,
                        date: `'${post['date']}'`,
                        type: `'${post['type']}'`,
                        slug: `'${post['slug']}'`,
                        count: `'${post['note_count']}'`
                    };
                    targetPosts.push(postInfo)
                }
            });
        });
}

const fetchMyPosts = async() => {
    await fetchBlog();
    var count = await getPostCount();
    var offset = 0;
    var bar = new ProgressBar('fetching [:bar] :percent', { total: 100, width: 100 });
    while (offset <= 100 /* count */ ) {
        await fetchPosts('', offset, 2);
        offset += 20;
        bar.tick(20);
    }
    _.each(targetPosts, (post) => { console.log(post.url, post.date, post.type, post.slug, post.count) });
}
fetchMyPosts();