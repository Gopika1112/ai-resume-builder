export const getURL = (path: string = "") => {
  let url =
    process.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your production domain
    process.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set on Vercel
    "http://localhost:3005/";

  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;

  // Remove leading `/` from path
  const cleanPath = path.charAt(0) === "/" ? path.substring(1) : path;

  return `${url}${cleanPath}`;
};
