import moment from "moment";
import slugify from "slugify";
import { Log4brainsError, ValueObject } from "@src/domain";
import { AdrFile } from "./AdrFile";
import { PackageRef } from "./PackageRef";

type Props = {
  value: string;
};

/**
 * Removes trailing "-" characters (linear time, unlike a /-+$/ regex)
 */
function trimTrailingDashes(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === "-") {
    end -= 1;
  }
  return value.slice(0, end);
}

export class AdrSlug extends ValueObject<Props> {
  constructor(value: string) {
    super({ value });

    if (this.namePart.includes("/")) {
      throw new Log4brainsError(
        "The / character is not allowed in the name part of an ADR slug",
        value
      );
    }
  }

  get value(): string {
    return this.props.value;
  }

  get packagePart(): string | undefined {
    const s = this.value.split("/", 2);
    return s.length >= 2 ? s[0] : undefined;
  }

  get namePart(): string {
    const s = this.value.split("/", 2);
    return s.length >= 2 ? s[1] : s[0];
  }

  static createFromFile(file: AdrFile, packageRef?: PackageRef): AdrSlug {
    const localSlug = file.path.basenameWithoutExtension;
    return new AdrSlug(
      packageRef ? `${packageRef.name}/${localSlug}` : localSlug
    );
  }

  static createFromTitle(
    title: string,
    packageRef?: PackageRef,
    date?: Date
  ): AdrSlug {
    const slugifiedTitle = trimTrailingDashes(
      slugify(title, {
        lower: true,
        strict: true
      })
    );
    const localSlug = `${moment(date).format("YYYYMMDD")}-${slugifiedTitle}`;
    return new AdrSlug(
      packageRef ? `${packageRef.name}/${localSlug}` : localSlug
    );
  }
}
