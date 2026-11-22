import React from "react";
import { render } from "@testing-library/react";
import { AdrHeader } from "./AdrHeader";

describe("AdrHeader", () => {
  it("renders correctly with deciders", () => {
    const { asFragment } = render(
      <AdrHeader
        adr={{
          slug: "test",
          package: "",
          title: "Test",
          status: "draft",
          supersededBy: null,
          tags: [],
          deciders: ["John Doe", "Lorem Ipsum", "Ipsum Dolor"],
          body: {
            enhancedMdx: "# Test",
            rawMarkdown: "#Test"
          },
          creationDate: new Date(2020, 0, 1).toJSON(),
          lastEditDate: new Date(2020, 0, 1).toJSON(),
          lastEditAuthor: "John Doe",
          publicationDate: null,
          file: {
            relativePath: "test.md",
            absolutePath: "/test.md"
          }
        }}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders correctly without deciders", () => {
    const { asFragment } = render(
      <AdrHeader
        adr={{
          slug: "test",
          package: "",
          title: "Test",
          status: "draft",
          supersededBy: null,
          tags: [],
          deciders: [],
          body: {
            enhancedMdx: "# Test",
            rawMarkdown: "#Test"
          },
          creationDate: new Date(2020, 0, 1).toJSON(),
          lastEditDate: new Date(2020, 0, 1).toJSON(),
          lastEditAuthor: "John Doe",
          publicationDate: null,
          file: {
            relativePath: "test.md",
            absolutePath: "/test.md"
          }
        }}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders correctly with package", () => {
    const { asFragment } = render(
      <AdrHeader
        adr={{
          slug: "test",
          package: "test",
          title: "Test",
          status: "draft",
          supersededBy: null,
          tags: [],
          deciders: [],
          body: {
            enhancedMdx: "# Test",
            rawMarkdown: "#Test"
          },
          creationDate: new Date(2020, 0, 1).toJSON(),
          lastEditDate: new Date(2020, 0, 1).toJSON(),
          lastEditAuthor: "John Doe",
          publicationDate: null,
          file: {
            relativePath: "test.md",
            absolutePath: "/test.md"
          }
        }}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders correctly with tags", () => {
    const { asFragment } = render(
      <AdrHeader
        adr={{
          slug: "test",
          package: "test",
          title: "Test",
          status: "draft",
          supersededBy: null,
          tags: ["foo", "bar"],
          deciders: [],
          body: {
            enhancedMdx: "# Test",
            rawMarkdown: "#Test"
          },
          creationDate: new Date(2020, 0, 1).toJSON(),
          lastEditDate: new Date(2020, 0, 1).toJSON(),
          lastEditAuthor: "John Doe",
          publicationDate: null,
          file: {
            relativePath: "test.md",
            absolutePath: "/test.md"
          }
        }}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders correctly with publication date", () => {
    const { asFragment } = render(
      <AdrHeader
        adr={{
          slug: "test",
          package: "test",
          title: "Test",
          status: "accepted",
          supersededBy: null,
          tags: [],
          deciders: [],
          body: {
            enhancedMdx: "# Test",
            rawMarkdown: "#Test"
          },
          creationDate: new Date(2020, 0, 1).toJSON(),
          lastEditDate: new Date(2020, 0, 1).toJSON(),
          lastEditAuthor: "John Doe",
          publicationDate: new Date(2020, 0, 2).toJSON(),
          file: {
            relativePath: "test.md",
            absolutePath: "/test.md"
          }
        }}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("shows the Github repository button", () => {
    const { asFragment } = render(
      <AdrHeader
        adr={{
          slug: "test",
          package: "test",
          title: "Test",
          status: "accepted",
          supersededBy: null,
          tags: [],
          deciders: [],
          body: {
            enhancedMdx: "# Test",
            rawMarkdown: "#Test"
          },
          creationDate: new Date(2020, 0, 1).toJSON(),
          lastEditDate: new Date(2020, 0, 1).toJSON(),
          lastEditAuthor: "John Doe",
          publicationDate: new Date(2020, 0, 2).toJSON(),
          file: {
            relativePath: "test.md",
            absolutePath: "/test.md"
          },
          repository: {
            provider: "github",
            viewUrl: "https://github.com/xxx"
          }
        }}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("shows the Gitlab repository button", () => {
    const { asFragment } = render(
      <AdrHeader
        adr={{
          slug: "test",
          package: "test",
          title: "Test",
          status: "accepted",
          supersededBy: null,
          tags: [],
          deciders: [],
          body: {
            enhancedMdx: "# Test",
            rawMarkdown: "#Test"
          },
          creationDate: new Date(2020, 0, 1).toJSON(),
          lastEditDate: new Date(2020, 0, 1).toJSON(),
          lastEditAuthor: "John Doe",
          publicationDate: new Date(2020, 0, 2).toJSON(),
          file: {
            relativePath: "test.md",
            absolutePath: "/test.md"
          },
          repository: {
            provider: "gitlab",
            viewUrl: "https://gitlab.com/xxx"
          }
        }}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("shows the generic repository button", () => {
    const { asFragment } = render(
      <AdrHeader
        adr={{
          slug: "test",
          package: "test",
          title: "Test",
          status: "accepted",
          supersededBy: null,
          tags: [],
          deciders: [],
          body: {
            enhancedMdx: "# Test",
            rawMarkdown: "#Test"
          },
          creationDate: new Date(2020, 0, 1).toJSON(),
          lastEditDate: new Date(2020, 0, 1).toJSON(),
          lastEditAuthor: "John Doe",
          publicationDate: new Date(2020, 0, 2).toJSON(),
          file: {
            relativePath: "test.md",
            absolutePath: "/test.md"
          },
          repository: {
            provider: "generic",
            viewUrl: "https://foo.com/xxx"
          }
        }}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("shows the locally edit button", () => {
    const { asFragment } = render(
      <AdrHeader
        adr={{
          slug: "test",
          package: "test",
          title: "Test",
          status: "accepted",
          supersededBy: null,
          tags: [],
          deciders: [],
          body: {
            enhancedMdx: "# Test",
            rawMarkdown: "#Test"
          },
          creationDate: new Date(2020, 0, 1).toJSON(),
          lastEditDate: new Date(2020, 0, 1).toJSON(),
          lastEditAuthor: "John Doe",
          publicationDate: new Date(2020, 0, 2).toJSON(),
          file: {
            relativePath: "test.md",
            absolutePath: "/test.md"
          },
          repository: {
            provider: "generic",
            viewUrl: "https://foo.com/xxx"
          }
        }}
        locallyEditable
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
