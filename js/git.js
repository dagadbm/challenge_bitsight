var gitHubAPI = (($) => {
    const _gitUrl = 'https://api.github.com';

    const _parseLinkHeader = (header) => {
        const parts = header.split(',');
        const links = {};

        for (let i = 0; i < parts.length; i++) {
            const section = parts[i].split(';');
            const url = section[0].replace(/<([^>]+)>/, '$1').trim();
            const name = section[1].replace(/rel="([^"]+)"/, '$1').trim();
            links[name] = url;
        }

        return links;
    };

    const getRepositories = async (searchDate) => {
        return await $.getJSON(_gitUrl + '/search/repositories?q=fork:true+created:>=' + searchDate + '&sort=stars,&order=desc&page=1&per_page=5');
    };

    const getUsers = async (searchDate) => {
        return await $.getJSON(_gitUrl + '/search/users?q=created:>=' + searchDate + '&sort=followers,&order=desc&page=1&per_page=1');
    };

    const getNumberOfFollowersPerUser = async (userLogin) => {
        debugger;
        //first call the main followers page and gather information about followers per page the total number of pages as well as the url to access the last page
        const followersFirstPagePromise = $.Deferred();
        $.getJSON(_gitUrl + '/users/' + userLogin + '/followers').done(
            (response, status, jqXhr) => {
                const followersPerPage = response.length;
                let lastPageUrl = "";
                let totalPageNumbers = 0;

                const navigation = jqXhr.getResponseHeader("link");
                if (navigation !== null) {
                    const links = _parseLinkHeader(navigation);
                    const lastPageRegex = /page=(\d+)/;
                    totalPageNumbers = lastPageRegex.exec(links["last"])[1];
                    lastPageUrl = links["last"];
                }
                debugger;
                followersFirstPagePromise.resolve({
                    followersPerPage: followersPerPage,
                    lastPageUrl: lastPageUrl,
                    totalPageNumbers: totalPageNumbers
                });
            });

        //afterwards, get the last page followers, after the first promise has completed
        const followersLastPagePromise = $.Deferred();
        followersFirstPagePromise.done((data) => {
            if (data.lastPageUrl !== "") {
                $.getJSON(data.lastPageUrl).done((response, status, jqXhr) => {
                    return followersLastPagePromise.resolve(response.length)
                });
            } else {
                return followersLastPagePromise.resolve(0);
            }
        });

        //you need both promises results to calculate the total number of followers
        return await $.when(followersFirstPagePromise, followersLastPagePromise).done((firstPagePromise, followersLastPage) => {
            if (followersLastPage !== 0) {
                return (firstPagePromise.totalPageNumbers - 1) * firstPagePromise.followersPerPage + followersLastPage
            } else {
                return firstPagePromise.followersPerPage;
            }
        });
    };

    return {
        getRepositories: getRepositories,
        getUsers: getUsers,
        getNumberOfFollowersPerUser: getNumberOfFollowersPerUser
    }
})(jQuery);