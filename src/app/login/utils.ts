export const isValidRedirect = (url: string): boolean => {
  return url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\");
};
