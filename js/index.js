//IIFE to prevent api calling from the window object
(($) => {
    $(document).ready(() => {
        $('#hot_repo').on('click', getRepositories);
        $('#prolific_users').on('click', getUsers);
        getRepositories();
        getUsers();
        setTimeout(refreshFollowers, 2 * 60 * 1000);
    });

    const getRepositories = async () => {
        $('#repositories_header, #repositories_body').hide();
        $('#repositories_error').addClass('is-hidden');
        const originalHotRepoHtml = $('#hot_repo').html();
        $('#hot_repo').html('<span class="icon is-small"> <i class="fa fa-spinner fa-spin"></i></span>');
        $('#hot_repo').prop('disabled', true);
        const today = new Date();
        today.setMonth(today.getMonth() - 1);
        today.setDate(1);
        const isoDateString = today.toISOString();
        const searchDate = isoDateString.substring(0, isoDateString.indexOf('T'));

        try {
            var response = await gitHubAPI.getRepositories(searchDate);
        } catch (err) {
            $('#hot_repo').html(originalHotRepoHtml);
            $('#hot_repo').prop('disabled', false);
            $('#repositories_header, #repositories_body').hide();
            $('#repositories_error').removeClass('is-hidden');
            return;
        }

        const repositories = response.items;
        const html = [];
        for (let key in repositories) {
            if (repositories.hasOwnProperty(key)) {
                const el = repositories[key];
                const id = el.id;
                const name = el.name;
                const description = el.description;
                const stars = el.stargazers_count;
                const url = el.html_url;

                html.push('<div class="column is-2">');
                html.push(id);
                html.push('</div>');

                html.push('<div class="column is-2 word-wrap">');
                html.push('<a class="is-link" href="');
                html.push(url);
                html.push('">')
                html.push(name);
                html.push('</a></div>');

                html.push('<div class="column is-7 word-wrap has-text-justify">');
                html.push(description);
                html.push('</div>');

                html.push('<div class="column is-1">');
                html.push(stars);
                html.push('</div>');
            }
        }
        $('#repositories_body').html(html.join(''));
        $('#repositories_header, #repositories_body').show();
        $('#hot_repo').html(originalHotRepoHtml);
        $('#hot_repo').prop('disabled', false);
    }

    const getUsers = async () => {
        $('#users_header, #users_body').hide();
        $('#users_error').addClass('is-hidden');
        const originalProlificUsersHtml = $('#prolific_users').html();
        $('#prolific_users').html('<span class="icon is-small"> <i class="fa fa-spinner fa-spin"></i></span>');
        $('#prolific_users').prop('disabled', true);

        const today = new Date();
        today.setMonth(0);
        today.setDate(1);
        today.setFullYear(today.getFullYear() - 1);
        const isoDateString = today.toISOString();
        const searchDate = isoDateString.substring(0, isoDateString.indexOf('T'));

        try {
            var response = await gitHubAPI.getUsers(searchDate);
        } catch (err) {
            $('#prolific_users').html(originalProlificUsersHtml);
            $('#prolific_users').prop('disabled', false);
            $('#users_header, #users_body').hide();
            $('#users_error').removeClass('is-hidden');
            return;
        }

        const repositories = response.items;
        const html = [];
        for (let key in repositories) {
            if (repositories.hasOwnProperty(key)) {
                const el = repositories[key];
                const id = el.id;
                const login = el.login;
                const avatarUrl = el.avatar_url;
                const url = el.html_url;

                html.push('<div class="columns is-mobile is-vcentered">');
                html.push('<div class="column">');
                html.push(id);
                html.push('</div>');

                html.push('<div class="column word-wrap">');
                html.push('<a class="is-link" href="');
                html.push(url);
                html.push('">')
                html.push(login);
                html.push('</a></div>');

                html.push('<div class="column">');
                html.push('<figure class="image is-64x64">');

                html.push('<img src="');
                html.push(avatarUrl);
                html.push('">');
                html.push('</figure>')

                html.push('</div>');

                html.push('<div class="column word-wrap" id="');
                html.push(login);
                html.push('_followers">');
                html.push('<span class="icon"> <i class="fa fa-spinner fa-spin"></i></span>');
                html.push('</div>');
                html.push('</div>');
            }
        }
        $('#users_body').html(html.join(''));
        $('#users_header, #users_body').show();
        refreshFollowers('N/A');
        $('#prolific_users').html(originalProlificUsersHtml);
        $('#prolific_users').prop('disabled', false);
    }

    const refreshFollowers = (htmlOnError) => {
        $('[id$="_followers"]').each((i, el) => {
            const userFollowers = $(el);
            const login = userFollowers.attr('id').split('_')[0];
            const previousValue = htmlOnError || userFollowers.html();
            refreshUserFollowers(login, (err) => {
                userFollowers.html(previousValue)
            });
        });
    }

    const refreshUserFollowers = async (login, errCallback) => {
        const userFollowers = $('#' + login + '_followers');

        try {
            var response = await gitHubAPI.getNumberOfFollowersPerUser(login);
        } catch (err) {
            errCallback();
            return;
        }

        userFollowers.html(response);
    }
})(jQuery); //pass jQuery to the scope of the IIFE