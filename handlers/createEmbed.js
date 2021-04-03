let discord = require("discord.js");
let config = require("../data/config.json")

module.exports = {
    createEmbed(type, title, description) {
        let embed = new discord.MessageEmbed()
        if (type == "success") {
            embed.setColor(config.embed.colors.success)
        } else if (type == "error") {
            embed.setColor(config.embed.colors.error)
        } else if (type == "warning") {
            embed.setColor(config.embed.colors.warning)
        } else {
            embed.setColor(config.embed.colors.default)
        }
        embed.setFooter(config.embed.preview.footer)
        embed.setThumbnail(config.embed.preview.thumbnail)
        if (config.embed.preview.timestamp) {
            embed.setTimestamp()
        }
        embed.setTitle(title)
        embed.setDescription(description);
        return embed
    }
}