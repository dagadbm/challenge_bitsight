//Revealing Module Pattern
var gitHubAPI = (($) => {
    const _gitUrl = 'https://api.github.com';

    const getRepositories = (searchDate) => {
        return $.getJSON(_gitUrl + '/search/repositories?q=fork:true+created:>=' + searchDate + '&sort=stars,&order=desc&page=1&per_page=5');
    };

    const getUsers = (searchDate) => {
        return $.getJSON(_gitUrl + '/search/users?q=created:>=' + searchDate + '&sort=followers,&order=desc&page=1&per_page=5');
    };

    const getNumberOfFollowersPerUser = async (userLogin) => {
        // call users/followers and get last page url, followers per page and total number of pages
        const getUserFollowersInfoResponse = await _getUserFollowersInfoPromise(userLogin);

        // if there is a last page url, get the last page number of followers
        let followersLastPage = 0;
        if (getUserFollowersInfoResponse.lastPageUrl !== '') {
            const getUserFollowersLastPageReponse = await $.getJSON(getUserFollowersInfoResponse.lastPageUrl);
            followersLastPage = getUserFollowersLastPageReponse.length;
        }

        // do the math for one or many follower pages
        if (followersLastPage !== 0) {
            return (getUserFollowersInfoResponse.totalPageNumbers - 1) * getUserFollowersInfoResponse.followersPerPage + followersLastPage
        } else {
            return followersPerPage;
        }
    };

    // Returns a promise compliant object with the following information:
    // followersPerPage, lastPageUrl (can be '' if user has few followers) and the totalPageNumbers of followers the user has
    const _getUserFollowersInfoPromise = (userLogin) => {
        // could have used new Promise(...) but it made the code a bit more callback hell'ish with extra levels of indentation
        const getUserFollowersPromise = $.Deferred();
        $.getJSON(_gitUrl + '/users/' + userLogin + '/followers',
            (response, status, jqXhr) => {
                const followersPerPage = response.length;
                let lastPageUrl = '';
                let totalPageNumbers = 0;

                const navigation = jqXhr.getResponseHeader('link');
                if (navigation !== null) {
                    const links = _parseLinkHeader(navigation);
                    const lastPageRegex = /page=(\d+)/;
                    totalPageNumbers = Number(lastPageRegex.exec(links['last'])[1]);
                    lastPageUrl = links['last'];
                }
                getUserFollowersPromise.resolve({
                    followersPerPage: followersPerPage,
                    lastPageUrl: lastPageUrl,
                    totalPageNumbers: totalPageNumbers
                });
            }).fail((err) =>
                getUserFollowersPromise.reject(err))
        return getUserFollowersPromise.promise();
    }

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

    return {
        getRepositories: getRepositories,
        getUsers: getUsers,
        getNumberOfFollowersPerUser: getNumberOfFollowersPerUser
    }
})(jQuery);