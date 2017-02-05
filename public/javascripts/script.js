$(document).ready(function() {

    //Smooth Scrolling

    $('a[href*="#"]:not([href="#"])').click(function() {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 1000);
                return false;
            }
        }
    });

    youtubeVideos();
    wikipediaData();
    khanAcademyVideos();
    researchPapersData();
    meetupData();

    if ($("#youtube-checkbox").is(":checked")) {
        $("#youtube-videos").parent().parent().parent().fadeIn();
    }

    if ($("#wikipedia-checkbox").is(":checked")) {
        $("#wikipedia-articles").parent().parent().parent().fadeIn();
    }

    if ($("#research-papers-checkbox").is(":checked")) {
        $("#research-papers").parent().parent().parent().fadeIn();

    }

    if ($("#khanacademy-checkbox").is(":checked")) {
        $("#khanacademy-videos").parent().parent().parent().fadeIn();
    }

    if ($("#people-checkbox").is(":checked")) {
        $("#meetups").parent().parent().parent().fadeIn();
    }

    if ($("#technologies-checkbox").is(":checked")) {

    }

    if ($("#apis-checkbox").is(":checked")) {

    }

    $(".filled-in").click(function(e) {
        var display = "";

        if ($(this).is(':checked')) {
            display = "block";

        } else {
            display = "none";

        }

        if ($(this).attr("id") == "youtube-checkbox") {
            $("#youtube-videos").parent().parent().parent().css("display", display);
            location.href = "#youtube-videos";

        } else if ($(this).attr("id") == "wikipedia-checkbox") {
            $("#wikipedia-articles").parent().parent().parent().css("display", display);

        } else if ($(this).attr("id") == "khanacademy-checkbox") {
            $("#khanacademy-videos").parent().parent().parent().css("display", display);

        } else if ($(this).attr("id") == "research-papers-checkbox") {
            $("#research-papers").parent().parent().parent().css("display", display);

        } else if ($(this).attr("id") == "people-checkbox") {
            $("#meetups").parent().parent().parent().css("display", display);

        }
    });

});

function meetupData() {

    $.get({
        type: "GET",
        url: "/dashboard/meetup",
        success: function(data) {
            console.log(data);

            data.meetups.forEach(function(meetup) {
                var card = '<li>';
                card += '<div class="card">';
                card += '<div class="card-image">';
                card += '<img height="200" src="/images/meetup-logo.png">';
                card += '<span style="font-size: 1.2em;" class=""></span>';
                card += '</div>';
                card += '<div class="card-content">';
                card += '<p>' + meetup.name + '</p>';
                card += '</div>';
                card += '<div class="card-action">';
                card += '<a target="_blank" href="' + meetup.event_url + '">Meet Now</a>';
                card += '</div>';
                card += '</div>';
                card += '</div>';
                card += '</li>';

                $("#meetups").append(card)
            });

        },
        error: function(err) {
            console.log("Unable to get meetup groups!");
            console.log(err);
        },
        dataType: "json"
    });

}


function wikipediaData() {

    $.get({
        type: "GET",
        url: "/dashboard/wikipedia",
        success: function(data) {
            console.log(data);

            data.articles.forEach(function(article) {

                var card = '<li>';
                card += '<div class="card">';
                card += '<div class="card-image">';
                card += '<img src="/images/wikipedia_thumbnail.jpg">';
                card += '<span class="card-title"></span>';
                card += '</div>';
                card += '<div class="card-content">';
                card += '<p>' + article.title + '</p>';
                card += '</div>';
                card += '<div class="card-action">';
                card += '<a target="_blank" href="' + article.url + '">Visit Link</a>';
                card += '</div>';
                card += '</div>';
                card += '</div>';
                card += '</li>';

                $("#wikipedia-articles").append(card);

            });


        },
        error: function(err) {
            console.log("Unable to get wikipedia articles!");
            console.log(err);
        },
        dataType: "json"
    });


}

function khanAcademyVideos() {

    $.get({
        type: "GET",
        url: "/dashboard/khanacademy",
        success: function(data) {
            console.log(data);

            for (keyword in data) {
                $("#khanacademy-keywords").append("<option value='" + keyword + "'>" + keyword + "</option>");
                $("#khanacademy-keywords").material_select();

            }

            $("#khanacademy-keywords").change(function() {
                var selectedKeyword = $(this).val();

                $("#khanacademy-videos").html("");

                data[selectedKeyword].videos.forEach(function(video) {
                    var card = '<li>';
                    card += '<iframe src="' + video.url + '"></iframe>';
                    card += '<h5 style="font-size: 1.5em">' + video.title + '</h5>';
                    card += '<div style="width: 20%">';
                    card += '</div>';
                    card += '</li>';

                    $("#khanacademy-videos").append(card)

                });

            });
        },
        error: function(err) {
            console.log("Unable to get khanacademy videos!");
            console.log(err);
        },
        dataType: "json"
    });


}

function researchPapersData() {
    $.get({
        type: "GET",
        url: "/dashboard/research-papers",
        success: function(data) {
            console.log(data);

            for (keyword in data) {
                $("#research-keywords").append("<option value='" + keyword + "'>" + keyword + "</option>");
                $("#research-keywords").material_select();

            }

            $("#research-keywords").change(function() {
                var selectedKeyword = $(this).val();

                $("#research-papers").html("");

                data[selectedKeyword].papers.forEach(function(paper) {
                    var card = '<li>';
                    card += '<div class="card">';
                    card += '<div class="card-image">';
                    card += '<img height="200" src="/images/research-papers-logo.png">';
                    card += '<span class="card-title"></span>';
                    card += '</div>';
                    card += '<div class="card-content">';
                    card += '<p>' + paper.title + '</p>';
                    card += '</div>';
                    card += '<div class="card-action">';
                    card += '<a target="_blank" href="' + paper.url + '">Visit Link</a>';
                    card += '</div>';
                    card += '</div>';
                    card += '</div>';
                    card += '</li>';

                    $("#research-papers").append(card);

                });

            });

        },
        error: function(err) {
            console.log("Unable to get research papers!");
            console.log(err);
        },
        dataType: "json"
    });
}

function youtubeVideos() {


    $.get({
        type: "GET",
        url: "/dashboard/youtube",
        success: function(data) {
            console.log(data);

            for (keyword in data) {
                $("#youtube-keywords").append("<option value='" + keyword + "'>" + keyword + "</option>");
                $("#youtube-keywords").material_select();

            }

            $("#youtube-keywords").change(function() {
                var selectedKeyword = $(this).val();

                $("#youtube-videos").html("");

                data[selectedKeyword].videos.forEach(function(video) {
                    var card = '<li>';
                    card += '<iframe src="' + video.url + '"></iframe>';
                    card += '<h5 style="font-size: 1.5em">' + video.title + '</h5>';
                    card += '<div style="width: 20%">';
                    card += '</div>';
                    card += '</li>';

                    $("#youtube-videos").append(card)

                });

            });
        },
        error: function(err) {
            console.log("Unable to get youtube videos!");
            console.log(err);
        },
        dataType: "json"
    });

}
