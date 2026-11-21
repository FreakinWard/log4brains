import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

export function cheerioToMarkdown(
  elt: cheerio.Cheerio<AnyNode>,
  keepLinks = true
): string {
  const html = elt.html();
  if (!html) {
    return "";
  }
  const copy = cheerio.load(html);

  if (keepLinks) {
    copy("a").each((i, linkElt) => {
      copy(linkElt).text(
        `[${copy(linkElt).text()}](${copy(linkElt).attr("href")})`
      );
    });
  }

  return copy("body").text();
}
