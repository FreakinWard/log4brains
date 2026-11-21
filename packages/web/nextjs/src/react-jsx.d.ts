// MUI v5 types reference `React.JSX`, which @types/react only declares from 17.0.62.
// Those versions add an `exports` map that Next.js 10 can't resolve, so @types/react stays on 17.0.4
// and `React.JSX` is declared here as an alias of the global `JSX`, like later @types/react 17 versions do.
// TODO: remove with the React 19 upgrade.
import "react";

declare module "react" {
  namespace JSX {
    type Element = globalThis.JSX.Element;
    type ElementClass = globalThis.JSX.ElementClass;
    type ElementAttributesProperty = globalThis.JSX.ElementAttributesProperty;
    type ElementChildrenAttribute = globalThis.JSX.ElementChildrenAttribute;
    type LibraryManagedAttributes<C, P> =
      globalThis.JSX.LibraryManagedAttributes<C, P>;
    type IntrinsicAttributes = globalThis.JSX.IntrinsicAttributes;
    type IntrinsicClassAttributes<T> =
      globalThis.JSX.IntrinsicClassAttributes<T>;
    type IntrinsicElements = globalThis.JSX.IntrinsicElements;
  }
}
