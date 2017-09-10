//IIFE to prevent api calling from the window object
(($) => {
    $(document).ready(() => {
        $("#hot_repo").on("click", getRepositories);
        $("#prolific_users").on("click", getUsers);
        getRepositories();
        getUsers();
        setTimeout(refreshFollowers, 2 * 60 * 1000);
    });

    const getRepositories = async () => {
        $("#repositories_table").hide();
        const today = new Date();
        today.setMonth(today.getMonth() - 1);
        today.setDate(1);
        const isoDateString = today.toISOString();
        const searchDate = isoDateString.substring(0, isoDateString.indexOf("T"));
        try {
            const response = await gitHubAPI.getRepositories(searchDate);
            const repositories = response.items;
            const html = [];
            for (let key in repositories) {
                if (repositories.hasOwnProperty(key)) {
                    const el = repositories[key];
                    const id = el.id;
                    const name = el.name;
                    const description = el.description;
                    const stars = el.stargazers_count;

                    html.push("<div class='columns is-mobile'>");
                    html.push("<div class='column is-2'>");
                    html.push(id);
                    html.push("</div>");

                    html.push("<div class='column'>");
                    html.push(name);
                    html.push("</div>");

                    html.push("<div class='column'>");
                    html.push(description);
                    html.push("</div>");

                    html.push("<div class='column is-1'>");
                    html.push(stars);
                    html.push("</div>");
                    html.push("</div>");
                }
            }
            $("#repositories_content").html(html.join(""));
            $("#repositories_table").show();
        } catch (err) {
        }
    }

    const getUsers = async () => {
        $("#users_table").hide();
        const today = new Date();
        today.setMonth(0);
        today.setDate(1);
        today.setFullYear(today.getFullYear() - 1);
        const isoDateString = today.toISOString();
        const searchDate = isoDateString.substring(0, isoDateString.indexOf("T"));
        try {
            const response = await gitHubAPI.getUsers(searchDate);
            const repositories = response.items;
            const html = [];
            for (let key in repositories) {
                if (repositories.hasOwnProperty(key)) {
                    let el = repositories[key];
                    let id = el.id;
                    let login = el.login;
                    let avatarUrl = el.avatar_url;

                    html.push("<div class='columns is-mobile'>");
                    html.push("<div class='column'>");
                    html.push(id);
                    html.push("</div>");

                    html.push("<div class='column'>");
                    html.push(login);
                    html.push("</div>");

                    html.push("<div class='column'>");
                    html.push("<figure class='image is-96x96'>");

                    html.push("<img src='");
                    html.push(avatarUrl);
                    html.push("'>");
                    html.push("</figure>")

                    html.push("</div>");

                    html.push("<div class='column' id='");
                    html.push(login);
                    html.push("_followers'>");
                    html.push("</div>");
                    html.push("</div>");
                }
            }
            $("#users_content").html(html.join(""));
            $("#users_table").show();
            refreshFollowers("N/A");
        } catch (err) {
            debugger;
        }
    }

    const refreshFollowers = (htmlOnError) => {
        $("[id$='_followers']").each((i, el) => {
            const userFollowers = $(el);
            const login = userFollowers.attr("id").split("_")[0];
            const previousValue = htmlOnError || userFollowers.html();
            refreshUserFollowers(login, (err) => {
                userFollowers.html(previousValue)
            });
        });
    }

    const refreshUserFollowers = async (login, errCallback) => {
        const userFollowers = $("#" + login + "_followers");
        try {
            const response = await gitHubAPI.getNumberOfFollowersPerUser(login);
            userFollowers.html(response);
        } catch (err) {
            debugger;
            errCallback();
        }
    }
})(jQuery); //pass jQuery to the scope of the IIFE