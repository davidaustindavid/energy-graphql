/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query Commodities {\n    commodities {\n      id\n      name\n      unit\n    }\n  }\n": typeof types.CommoditiesDocument,
    "\n  query Dashboard($commodity: Commodity!, $frequency: Frequency!, $range: DateRange) {\n    series(commodity: $commodity, frequency: $frequency, range: $range) {\n      source\n      commodity {\n        id\n        name\n        unit\n        eiaSeriesId\n      }\n      latest {\n        date\n        value\n      }\n      stats {\n        count\n        min\n        max\n        mean\n        change\n        changePercent\n      }\n      points {\n        date\n        value\n      }\n    }\n  }\n": typeof types.DashboardDocument,
    "\n  query BrentWtiSpread($frequency: Frequency!, $range: DateRange) {\n    spread(a: BRENT, b: WTI, frequency: $frequency, range: $range) {\n      points {\n        date\n        value\n      }\n    }\n  }\n": typeof types.BrentWtiSpreadDocument,
    "\n  query Alerts {\n    alerts {\n      id\n      direction\n      threshold\n      note\n      triggered\n      currentPrice\n      commodity {\n        id\n        name\n        unit\n      }\n    }\n  }\n": typeof types.AlertsDocument,
    "\n  mutation CreateAlert($input: CreateAlertInput!) {\n    createAlert(input: $input) {\n      id\n    }\n  }\n": typeof types.CreateAlertDocument,
    "\n  mutation DeleteAlert($id: ID!) {\n    deleteAlert(id: $id)\n  }\n": typeof types.DeleteAlertDocument,
};
const documents: Documents = {
    "\n  query Commodities {\n    commodities {\n      id\n      name\n      unit\n    }\n  }\n": types.CommoditiesDocument,
    "\n  query Dashboard($commodity: Commodity!, $frequency: Frequency!, $range: DateRange) {\n    series(commodity: $commodity, frequency: $frequency, range: $range) {\n      source\n      commodity {\n        id\n        name\n        unit\n        eiaSeriesId\n      }\n      latest {\n        date\n        value\n      }\n      stats {\n        count\n        min\n        max\n        mean\n        change\n        changePercent\n      }\n      points {\n        date\n        value\n      }\n    }\n  }\n": types.DashboardDocument,
    "\n  query BrentWtiSpread($frequency: Frequency!, $range: DateRange) {\n    spread(a: BRENT, b: WTI, frequency: $frequency, range: $range) {\n      points {\n        date\n        value\n      }\n    }\n  }\n": types.BrentWtiSpreadDocument,
    "\n  query Alerts {\n    alerts {\n      id\n      direction\n      threshold\n      note\n      triggered\n      currentPrice\n      commodity {\n        id\n        name\n        unit\n      }\n    }\n  }\n": types.AlertsDocument,
    "\n  mutation CreateAlert($input: CreateAlertInput!) {\n    createAlert(input: $input) {\n      id\n    }\n  }\n": types.CreateAlertDocument,
    "\n  mutation DeleteAlert($id: ID!) {\n    deleteAlert(id: $id)\n  }\n": types.DeleteAlertDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Commodities {\n    commodities {\n      id\n      name\n      unit\n    }\n  }\n"): (typeof documents)["\n  query Commodities {\n    commodities {\n      id\n      name\n      unit\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Dashboard($commodity: Commodity!, $frequency: Frequency!, $range: DateRange) {\n    series(commodity: $commodity, frequency: $frequency, range: $range) {\n      source\n      commodity {\n        id\n        name\n        unit\n        eiaSeriesId\n      }\n      latest {\n        date\n        value\n      }\n      stats {\n        count\n        min\n        max\n        mean\n        change\n        changePercent\n      }\n      points {\n        date\n        value\n      }\n    }\n  }\n"): (typeof documents)["\n  query Dashboard($commodity: Commodity!, $frequency: Frequency!, $range: DateRange) {\n    series(commodity: $commodity, frequency: $frequency, range: $range) {\n      source\n      commodity {\n        id\n        name\n        unit\n        eiaSeriesId\n      }\n      latest {\n        date\n        value\n      }\n      stats {\n        count\n        min\n        max\n        mean\n        change\n        changePercent\n      }\n      points {\n        date\n        value\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query BrentWtiSpread($frequency: Frequency!, $range: DateRange) {\n    spread(a: BRENT, b: WTI, frequency: $frequency, range: $range) {\n      points {\n        date\n        value\n      }\n    }\n  }\n"): (typeof documents)["\n  query BrentWtiSpread($frequency: Frequency!, $range: DateRange) {\n    spread(a: BRENT, b: WTI, frequency: $frequency, range: $range) {\n      points {\n        date\n        value\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Alerts {\n    alerts {\n      id\n      direction\n      threshold\n      note\n      triggered\n      currentPrice\n      commodity {\n        id\n        name\n        unit\n      }\n    }\n  }\n"): (typeof documents)["\n  query Alerts {\n    alerts {\n      id\n      direction\n      threshold\n      note\n      triggered\n      currentPrice\n      commodity {\n        id\n        name\n        unit\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateAlert($input: CreateAlertInput!) {\n    createAlert(input: $input) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation CreateAlert($input: CreateAlertInput!) {\n    createAlert(input: $input) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteAlert($id: ID!) {\n    deleteAlert(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteAlert($id: ID!) {\n    deleteAlert(id: $id)\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;