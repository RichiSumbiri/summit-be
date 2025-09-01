
export const buildMediaUrl = (path) => {
    if (!path) return  ""
    return `images/${path}`
}

export const limitFloating = (num, len = 6) => {
    if (num === null || num === undefined || isNaN(num)) return "0.000000";
    return Number(num).toFixed(6)
};