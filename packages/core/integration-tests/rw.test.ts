import path from "path";
import { globbySync } from "globby";
import { rmSync } from "fs";
import moment from "moment";
import { Log4brains } from "../src/infrastructure/api";
import { forceUnixPath } from "../src/lib/paths";

const PROJECT_PATH = forceUnixPath(path.join(__dirname, "rw-project"));

function clean(): void {
  globbySync([
    `${PROJECT_PATH}/**/*.md`,
    `!${PROJECT_PATH}/**/template.md`
  ]).forEach((fileToClean) => rmSync(fileToClean, { force: true }));
}

describe("E2E tests / RW", () => {
  jest.setTimeout(1000 * 15);

  beforeAll(clean);
  afterAll(clean);

  const instance = Log4brains.create(PROJECT_PATH);

  describe("createAdrFromTemplate()", () => {
    test("in global scope", async () => {
      await instance.createAdrFromTemplate(
        "create-adr-from-template",
        "Hello World"
      );
      const adr = await instance.getAdrBySlug("create-adr-from-template");

      expect(adr).toBeDefined();
      expect(adr?.title).toBe("Hello World");
      expect(adr?.status).toBe("draft");
      expect(adr?.package).toBeNull();
      expect(adr?.body.enhancedMdx).toMatchSnapshot();
    });

    test("in package with custom template", async () => {
      await instance.createAdrFromTemplate(
        "package1/create-adr-from-template-package-custom-template",
        "Foo Bar"
      );
      const adr = await instance.getAdrBySlug(
        "package1/create-adr-from-template-package-custom-template"
      );

      expect(adr).toBeDefined();
      expect(adr?.title).toBe("Foo Bar");
      expect(adr?.status).toBe("draft");
      expect(adr?.package).toBe("package1");
      expect(adr?.body.enhancedMdx).toMatchSnapshot();
    });

    test("in package with global template", async () => {
      await instance.createAdrFromTemplate(
        "package2/create-adr-from-template-package-global-template",
        "Foo Baz"
      );
      const adr = await instance.getAdrBySlug(
        "package2/create-adr-from-template-package-global-template"
      );

      expect(adr).toBeDefined();
      expect(adr?.title).toBe("Foo Baz");
      expect(adr?.status).toBe("draft");
      expect(adr?.package).toBe("package2");
      expect(adr?.body.enhancedMdx).toMatchSnapshot();
    });

    test("slug duplication", async () => {
      await instance.createAdrFromTemplate("duplicated-slug", "Hello World");
      await expect(
        instance.createAdrFromTemplate("duplicated-slug", "Hello World 2")
      ).rejects.toThrow();
    });

    test("unknown package", async () => {
      await expect(
        instance.createAdrFromTemplate("unknown-package/test", "Hello World")
      ).rejects.toThrow();
    });
  });

  describe("supersedeAdr()", () => {
    test("basic", async () => {
      await instance.createAdrFromTemplate("superseded", "Superseded");
      await instance.createAdrFromTemplate("superseder", "Superseder");
      await instance.supersedeAdr("superseded", "superseder");

      const superseded = await instance.getAdrBySlug("superseded");
      const superseder = await instance.getAdrBySlug("superseder");

      expect(superseded?.status).toBe("superseded");
      expect(superseded?.supersededBy).toEqual(superseder?.slug);
      expect(superseder?.body.enhancedMdx).toMatchSnapshot();
    });
  });

  describe("generateAdrSlug()", () => {
    test("duplicate", async () => {
      const date = moment().format("YYYYMMDD");
      const slug = await instance.generateAdrSlug("Duplicate Test");
      expect(slug).toBe(`${date}-duplicate-test`);

      await instance.createAdrFromTemplate(slug, "Duplicate Test");
      expect(await instance.generateAdrSlug("Duplicate Test")).toBe(
        `${date}-duplicate-test-2`
      );
    });
  });
});
