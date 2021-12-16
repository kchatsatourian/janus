import Janus from './janus.js';

let janus;

function count() {
    const length = janus.duplicates().length;
    const color = length > 0 ? "red" : "green";
    browser.browserAction.setBadgeText({text: length.toString()}).then();
    browser.browserAction.setBadgeBackgroundColor({"color": color}).then();
}

function initialize(tabs) {
    janus = new Janus(tabs);
    count();
}

function onRemoved(tab) {
    janus.remove(tab);
    count();
}

function onUpdated(tab, link) {
    janus.update(tab, link);
    count();
}

const filter = {
    properties: ['url']
}

browser.tabs.query({}).then(tabs => initialize(tabs));
browser.tabs.onRemoved.addListener((tabID, information) => onRemoved(tabID));
browser.tabs.onUpdated.addListener((tabID, information, tab) => onUpdated(tab.id, tab.url), filter);

function remove() {
    browser.tabs.remove(janus.duplicates()).then();
}

browser.commands.onCommand.addListener(command => remove());
browser.browserAction.onClicked.addListener((tab, information) => remove());
