const escapeRegExp = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const compilePath = (rawPath) => {
  const escaped = rawPath
    .split('/')
    .map(seg =>
      seg.startsWith(':') ? '[^/]+' : escapeRegExp(seg)
    )
    .join('/');

  return new RegExp(`^${escaped}$`);
};
