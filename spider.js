const fs = require("fs");
const request = require("request");
const iconv = require("iconv-lite");
const cheerio = require("cheerio");
// const  Thread = {
//     Sleep : function (d) {
//     return new Promise((a, r) => {
//     setTimeout(() => {
//       a()
//     }, d)
//   }) }
// }
let ret = [];
async function Main(keyword) {
  console.log("正在查询关键字: %s ", keyword);
  const maxPage = 5;
  for (let page = 1; page <= maxPage; page++) {
    var Url =
      "http://s.weibo.com/weibo/" +
      encodeURIComponent(keyword) +
      "&page=" +
      page;
    console.log("Url", Url);
    let html = await fetchHtml(Url);
    console.log('html',html)
    const $ = cheerio.load(html, { decodeEntities: false });
    $(".card-wrap .content").each((idx, element) => {
      // const $$ =  $(element);
      const name = $(element).children(".txt").attr("nick-name");

      let comment = $(element).children(".txt").text();
      // 去掉空格
      comment = comment.replace(/\ +/g, "");
      // 去掉回车
      comment = comment.replace(/[\r\n]/g, "");

      let timeStr = $(element).children(".from").children("a").first().text();

      // 去掉空格
      timeStr = timeStr.replace(/\ +/g, "");
      // 去掉回车
      timeStr = timeStr.replace(/[\r\n]/g, "");

      console.log("name, comment, timeStr", name, comment, timeStr);
      ret.push({
        name,
        comment,
        timeStr,
      });
    });
  }
  fs.writeFileSync("./ret.txt", JSON.stringify(ret));
  console.log("done!", ret);
}

function fetchHtml(url) {
  let cookies = fs.readFileSync("./cookies.txt");
  let headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.162 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.5",
    "WeiboData-Type": "application/x-www-form-urlencoded",
    Connection: "Keep-Alive",
    cookie: cookies.toString(),
  };
  let options = {
    method: "GET",
    url: url,
    headers: headers,
    gzip: true,
  };
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        response.setEncoding("utf-8");
        resolve(response.body);
      } else {
        console.log("error");
      }
    });
  });
}

let argvs = process.argv;
let keyword = argvs[2];
Main(keyword);


