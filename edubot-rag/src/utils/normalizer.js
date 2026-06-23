const withCharset = (mimetype) => {
    return `${mimetype}; charset=utf-8`;
};

const normalizeMimeType = (mimetype) => {
    return withCharset(mimetype);
};

export { normalizeMimeType };
