export default class Janus {

    #tabs;
    #links;

    constructor(tabs) {
        this.#tabs = new Map();
        this.#links = new Map();
        tabs.forEach(tab => this.update(tab.id, tab.url));
    }

    #decrement(link, tab) {
        if (!this.#links.has(link)) {
            return;
        }

        const tabs = this.#links.get(link);
        if (tabs.size > 1) {
            tabs.delete(tab);
            return;
        }

        this.#links.delete(link);
    }

    #increment(link, tab) {
        if (!this.#links.has(link)) {
            this.#links.set(link, new Set());
        }
        this.#links.get(link).add(tab);
    }

    duplicates() {
        let duplicates = new Set();
        for (const value of this.#links.values()) {
            duplicates = new Set([...duplicates, ...new Set([...value].filter((element, index) => index !== 0))]);
        }
        return Array.from(duplicates);
    }

    remove(tab) {
        this.#decrement(this.#tabs.get(tab), tab);
        this.#tabs.delete(tab);
    }

    update(tab, link) {
        const temporary = this.#tabs.get(tab);
        if (temporary !== link) {
            this.#decrement(temporary, tab);
        }
        this.#tabs.set(tab, link);
        this.#increment(link, tab);
    }
}
