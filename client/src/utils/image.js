// ImageKit can resize a photo from its URL: add ?tr=w-600 and it sends a
// smaller, compressed version (webp when the browser supports it).
// Other links (like /rings/R01/1.jpg) are returned unchanged.
export function sized(url, width) {
  if (!url || !/^https:\/\/ik\.imagekit\.io\//.test(url) || url.includes('tr=')) return url;
  return `${url}${url.includes('?') ? '&' : '?'}tr=w-${width}`;
}
