var settings = require("../data/settings.json")
module.exports = {
    config: {
        name: "close",
        aliases: []
    },
    run: async(bot, message, args) => {
        try {
            if (message.channel.name.startsWith("installation")) {
                if (settings.savePasswords) {
                    let category = message.guild.channels.cache.find(cat => cat.name === "storage")
                    if (category == undefined || category == null) {
                        message.guild.channels.create('storage', { type: 'category' }).then(category => {})
                        await new Promise(r => setTimeout(r, 1000));
                    }
                    let cat = message.guild.channels.cache.find(cat => cat.name === "storage")
                    let everyonerole = message.guild.roles.cache.find(role => role.name == "@everyone")
                    cat.overwritePermissions([{
                        id: message.guild.id,
                        deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                    }]);
                    cat.overwritePermissions([{
                        id: everyonerole.id,
                        deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                    }])
                    message.channel.setParent(cat.id)
                } else {
                    message.channel.delete()
                }
            }
        } catch (error) {
            return message.channel.send("**Error:** " + error)
        }
    }
}