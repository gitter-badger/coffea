/*jslint node: true, nomen: true*/
"use strict";

var _ = require('underscore');

var Channel = function (name, client) {
    this.name = name;
    this.client = client;
    this.topic = {};
    this.names = {};
};

Channel.prototype.toString = function () {
    return this.name;
};

Channel.prototype.getName = function () {
    return this.name;
};

Channel.prototype.getTopic = function () {
    return this.topic;
};

Channel.prototype.getNames = function () {
    return this.names; // {'nick': ['~']}
};

Channel.prototype.userHasMode = function (user, mode) {
    user = typeof user === "string" ? user : user.getNick();
    if (this.names.hasOwnProperty(user)) {
        return this.names[user].indexOf(mode) > -1;
    }
    return false;
};

Channel.prototype.isUserInChannel = function (user) {
    user = typeof user === "string" ? user : user.getNick();
    return this.names.hasOwnProperty(user);
};

Channel.prototype.notice = function (msg) {
    this.client.notice(this.getName(), msg);
};

Channel.prototype.say = function (msg) {
    this.client.send(this.getName(), msg);
};

Channel.prototype.reply = function (user, msg) {
    user = typeof user === "string" ? user : user.getNick();
    this.say(user + ': ' + msg);
};

Channel.prototype.kick = function (user, reason) {
    user = typeof user === "string" ? user : user.getNick();
    this.client.kick(this.getName(), user, reason);
};

Channel.prototype.ban = function (mask) {
    this.client.write('MODE ' + this.getName() + ' +b ' + mask);
};

Channel.prototype.unban = function (mask) {
    this.client.write('MODE ' + this.getName() + ' -b ' + mask);
};

module.exports = function () {
    var channelCache = [],
        channelList = [];
    return function (irc) {

        irc.getChannellist = function () {
            return channelList;
        };

        irc.getChannel = function (name) {
            var channel = _.find(channelCache, function (chan) {
                return chan.getName() === name;
            });
            if (channel === undefined) {
                channel = new Channel(name, irc);
                channelCache.push(channel);
            }
            return channel;
        };

        irc.isChannel = function (channel) {
            return channel instanceof Channel;
        };

        irc.on('join', function (event) {
            //add channel to list if we joined
            if (event.user.getNick() === irc.me.getNick()) {
                channelList.push(event.channel.getName());
                channelList = _.uniq(channelList);
            }
        });

        irc.on('part', function (event) {
            //remove channel from list if we parted
            if (event.user.getNick() === irc.me.getNick()) {
                event.channels.forEach(function (channel) {
                    channelList = _.without(channelList, channel.getName());
                });
            }
        });

        irc.on('kick', function (event) {
            //remove channel from list if we got kicked
            if (event.user.getNick() === irc.me.getNick()) {
                channelList = _.without(channelList, event.channel.getName());
            }
        });
    };
};