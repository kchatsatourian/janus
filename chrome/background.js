import Janus from './janus.js';

let janus;

function count() {
    const length = janus.duplicates().length;
    const color = length > 0 ? "red" : "green";
    chrome.action.setBadgeText({text: length.toString()}).then();
    chrome.action.setBadgeBackgroundColor({"color": color}).then();
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

chrome.tabs.query({}, tabs => initialize(tabs));
chrome.tabs.onRemoved.addListener((tabID, information) => onRemoved(tabID));
chrome.tabs.onUpdated.addListener((tabID, information, tab) => onUpdated(tab.id, tab.url));

function remove() {
    chrome.tabs.remove(janus.duplicates()).then();
}

chrome.commands.onCommand.addListener((command, tab) => remove());
chrome.action.onClicked.addListener(tab => remove());
