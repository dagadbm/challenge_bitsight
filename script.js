$(document).ready(() => {
    gitRepositories();
    gitUsers();
    setTimeout(refreshFollowers, 2 * 60 * 1000);
});

function gitRepositories() {
    var today = new Date();
    today.setMonth(today.getMonth() - 1);
    today.setDate(1);
    var isoDateString = today.toISOString();
    var searchDate = isoDateString.substring(0, isoDateString.indexOf("T"));
    $.getJSON('https://api.github.com/search/repositories?q=fork:true+created:>=' + searchDate + '&sort=stars,&order=desc&page=1&per_page=5',
        (response, status, jqXhr) => {
            var repositories = response.items;
            var tableBody = $('#repositories_content');
            var html = [];
            for (var key in repositories) {
                if (repositories.hasOwnProperty(key)) {
                    var el = repositories[key];
                    var id = el.id;
                    var name = el.name;
                    var description = el.description;
                    var stars = el.stargazers_count;

                    html.push("<div class='row'>");
                    html.push("<div class='col-2'>");
                    html.push(id);
                    html.push("</div>");

                    html.push("<div class='col-2'>");
                    html.push(name);
                    html.push("</div>");

                    html.push("<div class='col-6'>");
                    html.push(description);
                    html.push("</div>");

                    html.push("<div class='col-2'>");
                    html.push(stars);
                    html.push("</div>");
                    html.push("</div>");
                }
            }
            tableBody.html(html.join(""));
        });
}

function gitUsers() {
    let today = new Date();
    today.setMonth(0);
    today.setDate(1);
    today.setFullYear(today.getFullYear() - 1);
    let isoDateString = today.toISOString();
    let searchDate = isoDateString.substring(0, isoDateString.indexOf("T"));
    $.getJSON('https://api.github.com/search/users?q=created:>=' + searchDate + '&sort=followers,&order=desc&page=1&per_page=5',
        (response, status, jqXhr) => {
            let repositories = response.items;
            let tableBody = $('#users_content');
            let html = [];
            for (let key in repositories) {
                if (repositories.hasOwnProperty(key)) {
                    let el = repositories[key];
                    let id = el.id;
                    let login = el.login;
                    let avatarUrl = el.avatar_url;

                    html.push("<div class='row'>");
                    html.push("<div class='col-2'>");
                    html.push(id);
                    html.push("</div>");

                    html.push("<div class='col-2'>");
                    html.push(login);
                    html.push("</div>");

                    html.push("<div class='col-2'>");
                    html.push("<img class='img-thumbnail' height='230' width='230' src='");
                    html.push(avatarUrl);
                    html.push("'>");
                    html.push("</div>");

                    html.push("<div class='col-4'></div>");

                    html.push("<div class='col-2' id='");
                    html.push(login);
                    html.push("_followers'>");
                    html.push("...");
                    html.push("</div>");
                    html.push("</div>");
                    gitFollowers(login).then(v => $("#" + login + "_followers").html(v.totalNumberOfFollowers));
                }
            }
            tableBody.html(html.join(""));
        });
}

function gitFollowers(userLogin) {
    var userFollowersFirstCall = new Promise((resolve, reject) => $.getJSON('https://api.github.com/users/' + userLogin + '/followers',
        (response, status, jqXhr) => {
            let followersPerPage = response.length;
            let lastPageUrl = "";
            let totalPageNumbers = 0;
            let navigation = jqXhr.getResponseHeader("link");
            if (navigation !== null) {
                let links = parse_link_header(navigation);
                let lastPageRegex = /page=(\d+)/;
                totalPageNumbers = lastPageRegex.exec(links["last"])[1];
                lastPageUrl = links["last"];
            }
            resolve({
                followersPerPage: followersPerPage,
                lastPageUrl: lastPageUrl,
                totalPageNumbers: totalPageNumbers
            });
        }));

    var userFollowersLastCall =
        userFollowersFirstCall.then((data) => {
            let call = new Promise((resolve, reject) => $.getJSON(data.lastPageUrl, (response, status, jqXhr) => {
                resolve({
                    followersLastPage: response.length
                });
            }));
            return call;
        });

    return Promise.all([userFollowersFirstCall, userFollowersLastCall]).then(values => {
        let firstCall = values[0];
        let lastCall = values[1];
        return {
            totalNumberOfFollowers: (firstCall.totalPageNumbers - 1) * firstCall.followersPerPage + lastCall.followersLastPage
        };
    });

    function parse_link_header(header) {
        var parts = header.split(',');
        var links = {};

        $.each(parts, function (i, v) {
            var section = v.split(';');
            var url = section[0].replace(/<([^>]+)>/, '$1').trim();
            var name = section[1].replace(/rel="([^"]+)"/, '$1').trim();
            links[name] = url;
        });

        return links;
    }
}

function refreshFollowers() {
    $("[id$='_followers']").each((i, el) => {
        let login = el.id.split("_")[0];
        gitFollowers(login).then(v => $("#" + login + "_followers").html(v.totalNumberOfFollowers));
    }
    );
}