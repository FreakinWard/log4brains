import { AdrDto } from "@awarded/log4brains-core";

export type Adr = Omit<AdrDto, "supersededBy" | "body"> & {
  supersededBy: AdrLight | null;
  body: { enhancedMdx: string };
};

export type AdrLight = Pick<
  Adr,
  "slug" | "package" | "title" | "status" | "creationDate" | "publicationDate"
>;

export function toAdrLight(adr: AdrDto | Adr | AdrLight): AdrLight {
  return {
    slug: adr.slug,
    package: adr.package,
    title: adr.title,
    status: adr.status,
    creationDate: adr.creationDate,
    publicationDate: adr.publicationDate
  };
}

export function toAdr(dto: AdrDto, superseder?: AdrLight): Adr {
  if (dto.supersededBy && !superseder) {
    // An unresolvable superseder (e.g. a typo or a reference to an ADR that
    // does not exist) must never break the static build. Render the page
    // without the superseder link and warn, naming the ADR and its unresolved
    // target so the author can fix it.
    // eslint-disable-next-line no-console
    console.warn(
      `[log4brains] ADR "${dto.slug}" is "superseded by ${dto.supersededBy}", but no matching ADR was found. Rendering without the superseder link.`
    );
    return {
      ...dto,
      supersededBy: null,
      body: {
        enhancedMdx: dto.body.enhancedMdx
      }
    };
  }
  if (superseder && superseder.slug !== dto.supersededBy) {
    throw new Error(
      "The given superseder does not match the `supersededBy` field"
    );
  }

  return {
    ...dto,
    supersededBy: superseder ? toAdrLight(superseder) : null,
    body: {
      enhancedMdx: dto.body.enhancedMdx
    }
  };
}
