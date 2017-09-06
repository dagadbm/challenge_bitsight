function gitRepositories() {
    var today = new Date();
    today.setMonth(today.getMonth() - 1);
    today.setDate(1);
    var isoDateString = today.toISOString();
    var searchDate = isoDateString.substring(0, isoDateString.indexOf("T"));
    $.getJSON('https://api.github.com/search/repositories?q=fork:true+created:>=' + searchDate + '&sort=stars,&order=desc&page=1&per_page=5',
        (response, status, jqXhr) => {
            var repositories = response.items;
            var tableBody = $('#repositories_table_body');
            var html = [];
            for (var key in repositories) {
                if (repositories.hasOwnProperty(key)) {
                    var el = repositories[key];
                    var id = el.id;
                    var name = el.name;
                    var description = el.description;
                    var stars = el.stargazers_count;

                    html.push("<tr>");
                    html.push("<td>");
                    html.push(id);
                    html.push("</td>");
                    html.push("<td>");
                    html.push(name);
                    html.push("</td>");
                    html.push("<td>");
                    html.push(description);
                    html.push("</td>");
                    html.push("<td>");
                    html.push(stars);
                    html.push("</td>");
                    html.push("</tr>");
                }
            }
            tableBody.html(html.join(""));
        });
}

function gitUsers() {
    var today = new Date();
    today.setMonth(0);
    today.setDate(1);
    today.setFullYear(today.getFullYear() - 1);
    var isoDateString = today.toISOString();
    var searchDate = isoDateString.substring(0, isoDateString.indexOf("T"));
    $.getJSON('https://api.github.com/search/users?q=created:>=' + searchDate + '&sort=followers,&order=desc&page=1&per_page=5',
        (response, status, jqXhr) => {
            var repositories = response.items;
            var tableBody = $('#users_table_body');
            var html = [];
            for (var key in repositories) {
                if (repositories.hasOwnProperty(key)) {
                    var el = repositories[key];
                    var id = el.id;
                    var login = el.login;
                    var avatarUrl = el.avatar_url;
                    var followers = "TODO";

                    html.push("<tr>");
                    html.push("<td>");
                    html.push(id);
                    html.push("</td>");
                    html.push("<td>");
                    html.push(login);
                    html.push("</td>");
                    html.push("<td>");
                    html.push("<img src='");
                    html.push(avatarUrl);
                    html.push("'>");
                    html.push("</td>");
                    html.push("<td>");
                    html.push(followers);
                    html.push("</td>");
                    html.push("</tr>");
                }
            }
            tableBody.html(html.join(""));
        });
}

function gitFollowers(userLogin) {
    debugger;
    var followersPerPage = 0;
    var followersLastPage = 0;
    var totalPageNumbers = 0;
    var lastPageUrl = "";
    var totalNumberOfFollowers = 0;
    $.getJSON('https://api.github.com/users/' + userLogin + '/followers',
        (response, status, jqXhr) => {
            debugger;
            followersPerPage = response.length;
            var navigation = jqXhr.getResponseHeader("link");
            if (navigation !== null) {
                var links = parse_link_header(navigation);
                var lastPageRegex = /page=(\d+)/;
                totalPageNumbers = lastPageRegex.exec(links["last"])[1];
                lastPageUrl = links["last"];
            }
            debugger;
        }).done(() => {
            $.getJSON(lastPageUrl, (response, status, jqXhr) => {
                followersLastPage = response.length;
                debugger;
            });
        }).done(() => {
            totalNumberOfFollowers = (totalPageNumbers - 1) * followersPerPage + followersLastPage;
            debugger;
        });

    function parse_link_header(header) {
        var parts = header.split(',');
        var links = {};

        $.each(parts, function (p) {
            var section = p.split(';');
            var url = section[0].replace(/<([^>]+)>/, '$1').trim();
            var name = section[1].replace(/rel="([^"]+)"/, '$1').trim();
            links[name] = url;
        });

        return links;
    }
}