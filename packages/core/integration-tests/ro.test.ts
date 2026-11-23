/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from "moment";
import path from "path";
import { Log4brains } from "../src/infrastructure/api/Log4brains";
import { forceUnixPath } from "../src/lib/paths";

function prepareDataForSnapshot(data: any): any {
  const json = JSON.stringify(data);
  return JSON.parse(
    json.replace(
      new RegExp(forceUnixPath(path.resolve(__dirname)), "g"),
      "/ABSOLUTE-PATH"
    )
  );
}

describe("E2E tests / RO", () => {
  jest.setTimeout(1000 * 15);

  const instance = Log4brains.create(path.join(__dirname, "ro-project"));

  describe("searchAdrs()", () => {
    test("all", async () => {
      const adrs = await instance.searchAdrs();
      expect(adrs.map((adr) => adr.slug)).toMatchSnapshot(); // To see easily the order
      expect(prepareDataForSnapshot(adrs)).toMatchSnapshot();
    });

    test("with filter on statuses", async () => {
      const acceptedAdrs = await instance.searchAdrs({
        statuses: ["accepted"]
      });
      expect(
        acceptedAdrs.every((adr) => adr.status === "accepted")
      ).toBeTruthy();

      const supersededAdrs = await instance.searchAdrs({
        statuses: ["superseded"]
      });
      expect(
        supersededAdrs.every((adr) => adr.status === "superseded")
      ).toBeTruthy();

      const acceptedAndSupersededAdrs = await instance.searchAdrs({
        statuses: ["accepted", "superseded"]
      });
      expect(
        acceptedAndSupersededAdrs.every(
          (adr) => adr.status === "accepted" || adr.status === "superseded"
        )
      ).toBeTruthy();

      const acceptedAdrSlugs = acceptedAdrs.map((adr) => adr.slug);
      const supersededAdrSlugs = supersededAdrs.map((adr) => adr.slug);
      const acceptedAndSupersededAdrSlugs = acceptedAndSupersededAdrs.map(
        (adr) => adr.slug
      );
      const a = [...acceptedAdrSlugs, ...supersededAdrSlugs].sort();
      const b = [...acceptedAndSupersededAdrSlugs].sort();
      expect(b).toEqual(a);
    });
  });

  describe("getAdrBySlug()", () => {
    test("existing ADR", async () => {
      const adr = await instance.getAdrBySlug("20200101-first-adr");
      expect(prepareDataForSnapshot(adr)).toMatchSnapshot();
    });

    test("unknown ADR", async () => {
      const adr = await instance.getAdrBySlug("unknown");
      expect(adr).toBeUndefined();
    });

    test("resolves a same-package superseder to its package-qualified slug", async () => {
      const superseded = await instance.getAdrBySlug(
        "package1/20201028-superseded-in-package"
      );
      expect(superseded?.status).toBe("superseded");
      expect(superseded?.supersededBy).toBe(
        "package1/20201029-superseder-in-package"
      );

      // The resolved superseder must be retrievable by that slug: this is
      // exactly what the web build does in getStaticProps. Before the fix the
      // superseder resolved to a bare, package-less slug that matched no ADR,
      // which broke `log4brains build` for the whole multi-package site.
      const superseder = await instance.getAdrBySlug(
        superseded?.supersededBy ?? ""
      );
      expect(superseder?.slug).toBe("package1/20201029-superseder-in-package");
    });
  });

  describe("generateAdrSlug()", () => {
    test("in global scope", async () => {
      const date = moment().format("YYYYMMDD");
      expect(await instance.generateAdrSlug("My end-to-end test !")).toBe(
        `${date}-my-end-to-end-test`
      );
    });

    test("in a package", async () => {
      const date = moment().format("YYYYMMDD");
      expect(
        await instance.generateAdrSlug("My end-to-end test !", "package1")
      ).toBe(`package1/${date}-my-end-to-end-test`);
    });
  });
});
