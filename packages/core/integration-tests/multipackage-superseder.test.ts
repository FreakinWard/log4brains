import path from "path";
import { Log4brains } from "../src/infrastructure/api/Log4brains";

// Regression coverage for upstream thomvaill/log4brains#107: in a multi-package
// project a same-package supersession must resolve to the package-qualified
// slug. This exercises the real repository + transformer pipeline that the web
// static build relies on (getAdrBySlug in getStaticProps). It deliberately
// avoids snapshotting ADR data, whose creationDate/lastEditDate/lastEditAuthor
// come from Git and therefore change when these fixtures are (squash-)committed.
describe("E2E tests / multi-package superseder resolution (#107)", () => {
  jest.setTimeout(1000 * 15);

  const instance = Log4brains.create(
    path.join(__dirname, "multipackage-superseder-project")
  );

  test("resolves a same-package superseder referenced by a relative Markdown link", async () => {
    const superseded = await instance.getAdrBySlug(
      "mypackage/20201028-superseded-in-package"
    );
    expect(superseded?.status).toBe("superseded");
    expect(superseded?.supersededBy).toBe(
      "mypackage/20201029-superseder-in-package"
    );

    // The resolved superseder must be retrievable by that slug: this is exactly
    // what the web build does. Before the fix it resolved to a bare,
    // package-less slug that matched no ADR and broke `log4brains build`.
    const superseder = await instance.getAdrBySlug(
      superseded?.supersededBy ?? ""
    );
    expect(superseder?.slug).toBe("mypackage/20201029-superseder-in-package");
  });

  test("resolves a same-package superseder referenced by a bare slug", async () => {
    const superseded = await instance.getAdrBySlug(
      "mypackage/20201030-superseded-bare"
    );
    expect(superseded?.status).toBe("superseded");
    expect(superseded?.supersededBy).toBe(
      "mypackage/20201029-superseder-in-package"
    );
  });
});
