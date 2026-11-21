import { FilesystemPath } from "./FilesystemPath";

describe("FilesystemPath", () => {
  it("throws when CWD is not absolute", () => {
    expect(() => {
      new FilesystemPath(".", "test");
    }).toThrow();
  });

  it("returns the absolute path", () => {
    expect(new FilesystemPath("/foo", "./bar/test").absolutePath).toBe(
      "/foo/bar/test"
    );
    expect(new FilesystemPath("/foo", "bar/test").absolutePath).toBe(
      "/foo/bar/test"
    );
    expect(new FilesystemPath("/foo/bar", "../test").absolutePath).toBe(
      "/foo/test"
    );
  });

  it("returns the basename", () => {
    expect(new FilesystemPath("/foo", "bar/test").basename).toBe("test");
    expect(new FilesystemPath("/foo", "bar/test.md").basename).toBe("test.md");
  });

  it("returns the extension", () => {
    expect(new FilesystemPath("/foo", "bar/test").extension).toBe("");
    expect(new FilesystemPath("/foo", "bar/test.md").extension).toBe(".md");
  });

  it("returns the basename without the extension", () => {
    expect(
      new FilesystemPath("/foo", "bar/test").basenameWithoutExtension
    ).toBe("test");
    expect(
      new FilesystemPath("/foo", "bar/test.md").basenameWithoutExtension
    ).toBe("test");
  });

  it("joins a FilesystemPath to a string path", () => {
    expect(
      new FilesystemPath("/foo", "bar/test").join("hello-world.md").absolutePath
    ).toBe("/foo/bar/test/hello-world.md");
  });

  it("returns the relative path between two paths (from a directory)", () => {
    const from = new FilesystemPath("/test", "foo/bar");
    expect(from.relative(new FilesystemPath("/test", "foo"), true)).toBe("..");
    expect(
      from.relative(new FilesystemPath("/test", "foo/lorem/ipsum"), true)
    ).toBe("../lorem/ipsum");
    expect(
      from.relative(new FilesystemPath("/test", "foo/bar/test"), true)
    ).toBe("test");
  });

  it("returns the relative path between two paths (from a file)", () => {
    const from = new FilesystemPath("/test", "foo/bar.md");
    expect(from.relative(new FilesystemPath("/test", "foo"), false)).toBe("");
    expect(
      from.relative(new FilesystemPath("/test", "foo/lorem/ipsum"), false)
    ).toBe("lorem/ipsum");
    expect(from.relative(new FilesystemPath("/test", "bar/test"), false)).toBe(
      "../bar/test"
    );
  });
});
