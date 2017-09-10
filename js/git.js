var gitApi = (($) => {
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

    const getRepositories = (searchDate, callback) => {
        return new Promise((resolve, reject) => $.getJSON(_gitUrl + '/search/repositories?q=fork:true+created:>=' + searchDate + '&sort=stars,&order=desc&page=1&per_page=5', (response) => resolve(response)));
    };

    const getUsers = (searchDate, callback) => {
        return new Promise((resolve, reject) => $.getJSON(_gitUrl + '/search/users?q=created:>=' + searchDate + '&sort=followers,&order=desc&page=1&per_page=5', (response) => resolve(response)));
    };

    const getNumberOfFollowersPerUser = (userLogin) => {
        //first call the main followers page and gather information about followers per page the total number of pages as well as the url to access the last page
        const followersFirstPagePromise = new Promise((resolve, reject) => $.getJSON(_gitUrl + '/users/' + userLogin + '/followers',
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
                resolve({
                    followersPerPage: followersPerPage,
                    lastPageUrl: lastPageUrl,
                    totalPageNumbers: totalPageNumbers
                });
            }));

        //afterwards, get the last page followers, after the first promise has completed
        const followersLastPagePromise = followersFirstPagePromise.then((data) => {
            return new Promise((resolve, reject) => $.getJSON(data.lastPageUrl, (response, status, jqXhr) => {
                resolve({
                    followersLastPage: response.length
                });
            }));
        });

        //you need both promises results to calculate the total number of followers
        return Promise.all([followersFirstPagePromise, followersLastPagePromise]).then(values => {
            let firstPagePromise = values[0];
            let lastPagePromise = values[1];
            return {
                totalNumberOfFollowers: (firstPagePromise.totalPageNumbers - 1) * firstPagePromise.followersPerPage + lastPagePromise.followersLastPage
            };
        });
    }

    return {
        getRepositories: getRepositories,
        getUsers: getUsers,
        getNumberOfFollowersPerUser: getNumberOfFollowersPerUser
    }
})(jQuery);