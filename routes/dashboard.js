var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var admin = require("firebase-admin");
var router = express.Router();

/* GET dashboard page. */
router.get('/', function(req, res, next) {
    res.render('dashboard');
});

function ISODateString(d) {
    function pad(n) {
        return n < 10 ? '0' + n : n
    }
    return d.getUTCFullYear() - 1 + '-' +
        pad(d.getUTCMonth() + 1) + '-' +
        pad(d.getUTCDate()) + 'T' +
        pad(d.getUTCHours()) + ':' +
        pad(d.getUTCMinutes()) + ':' +
        pad(d.getUTCSeconds()) + 'Z'
}

router.get("/youtube", function(req, res, next) {

    getUserData(function(data) {

        var keywords = data.keywords;

        var videosObject = {};
        var count = 0;

        for (var i = 0; i < keywords.length; i++) {
            (function(i) {
                getYoutubeData(keywords[i], function(allVideos) {

                    var keyword = keywords[i];

                    videosObject[keyword] = {

                        videos: allVideos,
                        keyword: keyword

                    };

                    count++;

                    if (count == keywords.length) {
                        res.send(videosObject);
                    }

                });
            })(i);
        }

    });

});

router.get("/meetup", function(req, res, next) {
    getUserData(function(data) {

        var category = data.subCategory;

        getMeetupData(category, function(meetups) {

            res.send({
                meetups: meetups
            })

        });

    });
});

router.get("/research-papers", function(req, res, next) {
    getUserData(function(data) {

        var keywords = data.keywords;

        var papersObject = {};
        var count = 0;

        for (var i = 0; i < keywords.length; i++) {
            (function(i) {
                getResearchData(keywords[i], function(err, papers) {

                    if (err) {

                    } else {
                        var keyword = keywords[i];

                        papersObject[keyword] = {

                            papers: papers

                        };
                    }

                    count++;

                    if (count == keywords.length) {
                        res.send(papersObject);
                    }

                });
            })(i);
        }

    });
});

router.get("/khanacademy", function(req, res, next) {

    getUserData(function(data) {
        var keywords = data.keywords;

        var videosObject = {};
        var count = 0;

        for (var i = 0; i < keywords.length; i++) {
            (function(i) {
                getKhanAcademyData(keywords[i], function(allVideos) {

                    var keyword = keywords[i];

                    videosObject[keyword] = {

                        videos: allVideos,
                        keyword: keyword

                    };

                    count++;

                    if (count == keywords.length) {
                        res.send(videosObject);
                    }

                });
            })(i);
        }
    });

});

router.get("/wikipedia", function(req, res, next) {

    getUserData(function(data) {

        var keywords = data.keywords;

        var articles = [];
        var count = 0;

        for (var i = 0; i < keywords.length; i++) {
            (function(i) {
                getWikipediaData(keywords[i], function(err, article) {

                    if (err) {

                    } else {

                        articles.push(article);
                    }

                    count++;

                    if (count == keywords.length) {
                        res.send({
                            articles: articles
                        });
                    }

                });
            })(i);
        }

    });

});

var getUserData = function(callback) {
    var db = admin.database();

    db.ref("projects").on("value", function(snapshot) {

        callback(snapshot.val());

    }, function(errorObject) {

        console.log("The read failed: " + errorObject.code);

    });
}

var getMeetupData = function(query, callback) {

    var queryStrings = {
        sign: true,
        key: "315e75b1f361b4680146f6e631af41",
        search: query,
        page: 20
    };

    var options = {
        url: "https://api.meetup.com/topics",
        qs: queryStrings,
        method: "GET"
    }

    request(options, function(err, res, data) {
        if (err) {
            console.log(err);
            return;
        }

        //console.log(body);

        var dataJSON = JSON.parse(data);

        var objectIds = [];

        for (var i = 0; i < dataJSON.results.length; i++) {
            objectIds.push(dataJSON.results[i].id);
        }

        var queryStrings2 = {
            sign: true,
            key: "315e75b1f361b4680146f6e631af41",
            zip: 95014,
            country: "USA",
            city: "Cupertino",
            state: "California",
            topic_id: objectIds
        };

        var options2 = {
            url: "https://api.meetup.com/2/concierge",
            qs: queryStrings2,
            method: "GET"
        }

        request(options2, function(err, res, data) {
            var meetups = [];

            var dataJSON = JSON.parse(data);
            console.log(dataJSON.results.length);

            var count = 0;

            for (var a = 0; a < dataJSON.results.length; a++) {
                (function(a) {
                    request(dataJSON.results[a].event_url, function(err, res, data) {
                        var $ = cheerio.load(data);

                        var imgSrc = $('#C_metabox > a > img').attr("src");

                        if (dataJSON.results[a].venue) {
                            meetups.push({
                                country: dataJSON.results[a].venue.country,
                                city: dataJSON.results[a].venue.city,
                                address: dataJSON.results[a].venue.address_1,
                                state: dataJSON.results[a].venue.state,
                                name: dataJSON.results[a].name,
                                description: dataJSON.results[a].description,
                                event_url: dataJSON.results[a].event_url,
                                img: imgSrc
                            });
                        }

                        count++;

                        if (count == dataJSON.results.length) {
                            callback(meetups);
                        }

                    });
                })(a);

            }

        });

    });
}


var getResearchData = function(query, callback) {

    var queryStrings = {
        page: 1,
        pageSize: 10,
        apiKey: "0RSzhrQIOTGY5CAZW7BnFvjPoa6xwmiu"
    }

    var options = {
        url: 'https://core.ac.uk/api-v2/search/' + encodeURIComponent(query),
        qs: queryStrings,
        method: "GET"
    }

    request(options, function(err, res, data) {
        if (err) {
            console.log(err);
            return;
        }

        //console.log(body);

        var dataJSON = JSON.parse(data);
        console.log(dataJSON);

        var papers = [];
        var count = 0;

        if (dataJSON.data) {
            for (var i = 0; i < dataJSON.data.length; i++) {
                (function(i) {

                    var url = "https://core.ac.uk/display/" + dataJSON.data[i].id;

                    request(url, function(err, res, body) {
                        var $ = cheerio.load(body);

                        var title = $('.title').text().trim();
                        var imgSrc = "https://core.ac.uk/" + $('#preview_image').attr("src");

                        if (title) {
                            papers.push({
                                title: title,
                                url: url,
                                img: imgSrc
                            })
                        }

                        count++;

                        if (count == dataJSON.data.length) {
                            callback(null, papers);
                        }

                    });


                })(i);
            }
        } else {
          callback(null, papers);

        }

    });
}


var getWikipediaData = function(query, callback) {
    request('https://en.wikipedia.org/w/api.php?action=opensearch&search=' + encodeURIComponent(query) + '&limit=5&namespace=0&format=json', function(err, res, body) {
        if (err) {
            console.log("ERRR");
            console.log(err);
            return;
        }

        var bodyJson = JSON.parse(body);
        var url = bodyJson[3][0];

        if (bodyJson[3].length == 0) {
            var err = "No data found for wiki query " + query;
            console.log(err);
            callback(err, null);
            return;
        }

        console.log(bodyJson);

        request(url, function(err, res, body) {
            var $ = cheerio.load(body);

            var title = $('title').text().trim();
            var desc = $('p').eq(0).text().trim();

            if (title && desc) {
                var articleObj = {
                    title: title,
                    description: desc,
                    url: url
                };
                callback(null, articleObj);
            } else {
                callback("Error string: couldn't find title and desc", null);
            }
        });
    });
}

var getKhanAcademyData = function(query, callback) {

    var d = new Date();
    var lastDate = ISODateString(d);

    var queryStrings = {
        part: "snippet,id",
        channelId: "UC4a-Gbdw7vOaccHmFo40b9g",
        q: query,
        type: "video",
        order: "viewCount",
        videoSyndicated: true,
        maxResults: 10,
        key: "AIzaSyD7Bs9ERt-Kxx77tMqrCne-pt1K4wUJom0"
    };

    var options = {
        url: "https://www.googleapis.com/youtube/v3/search",
        qs: queryStrings,
        method: "GET"
    }

    request(options, function(err, res, data) {
        if (err) {
            console.log(err);
            return;
        }

        var dataJSON = JSON.parse(data);

        //console.log(dataJSON);

        var allVideos = [];

        for (var i = 0; i < dataJSON.items.length; i++) {
            var video = {
                url: "https://www.youtube.com/embed/" + dataJSON.items[i].id.videoId,
                title: dataJSON.items[i].snippet.title,
                description: dataJSON.items[i].snippet.description,
                publishedDate: dataJSON.items[i].snippet.publishedAt,
                channelTitle: dataJSON.items[i].snippet.channelTitle,
                thumbnails: dataJSON.items[i].snippet.thumbnails
            }

            allVideos.push(video);
        }

        callback(allVideos);

    });
}



var getYoutubeData = function(query, callback) {

    var d = new Date();
    var lastDate = ISODateString(d);

    var queryStrings = {
        part: "snippet,id",
        q: query,
        type: "video",
        order: "viewCount",
        videoSyndicated: true,
        relevanceLanguage: "en",
        maxResults: 10,
        key: "AIzaSyD7Bs9ERt-Kxx77tMqrCne-pt1K4wUJom0"
    };

    var options = {
        url: "https://www.googleapis.com/youtube/v3/search",
        qs: queryStrings,
        method: "GET"
    }

    request(options, function(err, res, data) {
        if (err) {
            console.log(err);
            return;
        }

        var dataJSON = JSON.parse(data);

        //  console.log(dataJSON);

        var allVideos = [];

        for (var i = 0; i < dataJSON.items.length; i++) {
            var video = {
                url: "https://www.youtube.com/embed/" + dataJSON.items[i].id.videoId,
                title: dataJSON.items[i].snippet.title,
                description: dataJSON.items[i].snippet.description,
                publishedDate: dataJSON.items[i].snippet.publishedAt,
                channelTitle: dataJSON.items[i].snippet.channelTitle,
                thumbnails: dataJSON.items[i].snippet.thumbnails
            }

            allVideos.push(video);
        }

        callback(allVideos);

    });
}

module.exports = router;
