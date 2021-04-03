const fs = require("fs");
let installs = require("../data/installs.json")

module.exports = {
    getInstallsAmount() {
        return Object.keys(installs).length + 1;
    },

    importInstall(userid, channelid, messageid, api_url) {
        installs[channelid] = {
            user: userid,
            channel: channelid,
            messageid: messageid,
            api: api_url,
            finished: false
        }
        fs.writeFile("./data/installs.json", JSON.stringify(installs), (err) => {
            if (err) console.log(err)
        })
        return "";
    },

    installsPerUser(userid) {
        var installsdone = 0
        for (var i = 0; i < Object.keys(installs).length; i++) {
            if (installs[Object.keys(installs)[i]].user == userid) {
                installsdone++
            }
        }
        return installsdone;
    }
}