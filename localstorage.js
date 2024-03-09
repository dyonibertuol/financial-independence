function getSavedValue(key, defaultValue = {}) {
    return JSON.parse(localStorage.getItem(key)) || defaultValue
}

function saveValue(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
}