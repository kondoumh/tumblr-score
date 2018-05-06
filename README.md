Fetch Tumblr Posts score 
=============================================
copy config/default.json --> config/production.json

modify production.json

```json
{
    "Blog": {
        "identifier": "your.tumblr.identifier",
        "apiKey": "yourapikey"
    }
}
```
- npm install
- npm run production

Result file(CSV / JSON) will be created.

- work/tumblr-score-YYYYmmddHHmmdd.csv
- work/tumblr-score-YYYYmmddHHmmdd.json

Output image(JSON)

```json
[
  {
    "url": "'https://reblog.kondoumh.com/post/173599194007'",
    "date": "'2018-05-05 06:22:13 GMT'",
    "type": "'quote'",
    "slug": "'私は財務面のことはよく知らないのですがゲームアンドウォッチの発売前任天堂は70億とも80億'",
    "count": "'36'"
  },
  {
    "url": "'https://reblog.kondoumh.com/post/173564859897'",
    "date": "'2018-05-04 03:13:22 GMT'",
    "type": "'quote'",
    "slug": "'自然現象はなぜ数学で説明できるのか-質問'",
    "count": "'194'"
  },
  {
    "url": "'https://reblog.kondoumh.com/post/173539445457'",
    "date": "'2018-05-03 07:49:24 GMT'",
    "type": "'quote'",
    "slug": "'車いすの天才科学者として知られた英物理学者スティーブンホーキング博士が３月に死去する前に書き上'",
    "count": "'2'"
  }
```

'count' attribute is the sum of reblog and liked.