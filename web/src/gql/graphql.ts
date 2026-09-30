/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AlertDirection =
  | 'ABOVE'
  | 'BELOW';

/** The energy benchmarks this API knows about. */
export type Commodity =
  /** Brent crude oil, North Sea */
  | 'BRENT'
  /** Henry Hub natural gas, Erath, LA */
  | 'HENRY_HUB'
  /** West Texas Intermediate crude oil, Cushing, OK */
  | 'WTI';

export type CreateAlertInput = {
  commodity: Commodity;
  direction: AlertDirection;
  note?: string | null | undefined;
  threshold: number;
};

/** Where the numbers came from. */
export type DataSource =
  /** Live data from the U.S. Energy Information Administration API */
  | 'EIA'
  /** Built-in synthetic data used when no EIA_API_KEY is set. Not real prices. */
  | 'SAMPLE';

export type DateRange = {
  /** Inclusive start date (same format as PricePoint.date) */
  from?: string | null | undefined;
  /** Inclusive end date */
  to?: string | null | undefined;
};

/** How often a series is sampled. */
export type Frequency =
  | 'DAILY'
  | 'MONTHLY'
  | 'WEEKLY';

export type CommoditiesQueryVariables = Exact<{ [key: string]: never; }>;


export type CommoditiesQuery = { commodities: Array<{ id: Commodity, name: string, unit: string }> };

export type DashboardQueryVariables = Exact<{
  commodity: Commodity;
  frequency: Frequency;
  range?: DateRange | null | undefined;
}>;


export type DashboardQuery = { series: { source: DataSource, commodity: { id: Commodity, name: string, unit: string, eiaSeriesId: string }, latest: { date: string, value: number } | null, stats: { count: number, min: number, max: number, mean: number, change: number, changePercent: number } | null, points: Array<{ date: string, value: number }> } };

export type BrentWtiSpreadQueryVariables = Exact<{
  frequency: Frequency;
  range?: DateRange | null | undefined;
}>;


export type BrentWtiSpreadQuery = { spread: { points: Array<{ date: string, value: number }> } };

export type AlertsQueryVariables = Exact<{ [key: string]: never; }>;


export type AlertsQuery = { alerts: Array<{ id: string, direction: AlertDirection, threshold: number, note: string | null, triggered: boolean, currentPrice: number | null, commodity: { id: Commodity, name: string, unit: string } }> };

export type CreateAlertMutationVariables = Exact<{
  input: CreateAlertInput;
}>;


export type CreateAlertMutation = { createAlert: { id: string } };

export type DeleteAlertMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteAlertMutation = { deleteAlert: boolean };


export const CommoditiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Commodities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commodities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}}]}}]} as unknown as DocumentNode<CommoditiesQuery, CommoditiesQueryVariables>;
export const DashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Dashboard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"commodity"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Commodity"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frequency"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Frequency"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"range"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateRange"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"series"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"commodity"},"value":{"kind":"Variable","name":{"kind":"Name","value":"commodity"}}},{"kind":"Argument","name":{"kind":"Name","value":"frequency"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frequency"}}},{"kind":"Argument","name":{"kind":"Name","value":"range"},"value":{"kind":"Variable","name":{"kind":"Name","value":"range"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"commodity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"eiaSeriesId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"latest"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"mean"}},{"kind":"Field","name":{"kind":"Name","value":"change"}},{"kind":"Field","name":{"kind":"Name","value":"changePercent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"points"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<DashboardQuery, DashboardQueryVariables>;
export const BrentWtiSpreadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BrentWtiSpread"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frequency"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Frequency"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"range"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateRange"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spread"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"a"},"value":{"kind":"EnumValue","value":"BRENT"}},{"kind":"Argument","name":{"kind":"Name","value":"b"},"value":{"kind":"EnumValue","value":"WTI"}},{"kind":"Argument","name":{"kind":"Name","value":"frequency"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frequency"}}},{"kind":"Argument","name":{"kind":"Name","value":"range"},"value":{"kind":"Variable","name":{"kind":"Name","value":"range"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"points"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<BrentWtiSpreadQuery, BrentWtiSpreadQueryVariables>;
export const AlertsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Alerts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alerts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"threshold"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"triggered"}},{"kind":"Field","name":{"kind":"Name","value":"currentPrice"}},{"kind":"Field","name":{"kind":"Name","value":"commodity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}}]}}]}}]} as unknown as DocumentNode<AlertsQuery, AlertsQueryVariables>;
export const CreateAlertDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAlert"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateAlertInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAlert"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateAlertMutation, CreateAlertMutationVariables>;
export const DeleteAlertDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAlert"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAlert"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteAlertMutation, DeleteAlertMutationVariables>;