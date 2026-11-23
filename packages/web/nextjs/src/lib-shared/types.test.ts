import { AdrDto } from "@awarded/log4brains-core";
import { toAdr } from "./types";

function buildDto(overrides: Partial<AdrDto> = {}): AdrDto {
  return {
    slug: "mypackage/20201028-superseded",
    package: "mypackage",
    title: "Superseded ADR",
    status: "superseded",
    supersededBy: "mypackage/20201029-superseder",
    tags: [],
    deciders: [],
    body: { rawMarkdown: "", enhancedMdx: "" },
    creationDate: "2020-10-28T00:00:00.000Z",
    lastEditDate: "2020-10-28T00:00:00.000Z",
    lastEditAuthor: "Anonymous",
    publicationDate: null,
    file: {
      relativePath: "packages/mypackage/adr/20201028-superseded.md",
      absolutePath: "/abs/packages/mypackage/adr/20201028-superseded.md"
    },
    ...overrides
  };
}

describe("toAdr()", () => {
  it("maps a resolved superseder to an AdrLight", () => {
    const superseder = {
      slug: "mypackage/20201029-superseder",
      package: "mypackage",
      title: "Superseder ADR",
      status: "accepted" as const,
      creationDate: "2020-10-29T00:00:00.000Z",
      publicationDate: null
    };
    const adr = toAdr(buildDto(), superseder);
    expect(adr.supersededBy?.slug).toBe("mypackage/20201029-superseder");
  });

  it("does not throw when the superseder cannot be resolved and renders without the link", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const adr = toAdr(buildDto({ supersededBy: "mypackage/missing" }));
      expect(adr.supersededBy).toBeNull();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("mypackage/20201028-superseded")
      );
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("mypackage/missing")
      );
    } finally {
      warn.mockRestore();
    }
  });

  it("still throws when a mismatched superseder is passed", () => {
    const wrong = {
      slug: "mypackage/some-other-adr",
      package: "mypackage",
      title: "Wrong ADR",
      status: "accepted" as const,
      creationDate: "2020-10-29T00:00:00.000Z",
      publicationDate: null
    };
    expect(() => toAdr(buildDto(), wrong)).toThrow();
  });
});
