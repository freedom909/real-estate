//helper/tool.ts

const compilePath = (rawPath: string) => {
  const escaped = rawPath
    .split('/')
    .map(seg =>
      seg.startsWith(':') ? '[^/]+' : escapeRegExp(seg)
    )
    .join('/');

  return new RegExp(`^${escaped}$`);
};

const escapeRegExp = (str: string) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export { compilePath, escapeRegExp };


