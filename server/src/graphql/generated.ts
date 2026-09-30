import type { GraphQLResolveInfo } from 'graphql';
import type { SeriesModel, SpreadModel, AlertModel } from '../data/models.js';
import type { AppContext } from '../context.js';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

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

/** Static information about a commodity. */
export type CommodityInfo = {
  __typename?: 'CommodityInfo';
  /** The EIA series id, e.g. RWTC */
  eiaSeriesId: Scalars['String']['output'];
  id: Commodity;
  name: Scalars['String']['output'];
  /** Unit the price is quoted in, e.g. "USD per barrel" */
  unit: Scalars['String']['output'];
};

export type CreateAlertInput = {
  commodity: Commodity;
  direction: AlertDirection;
  note?: InputMaybe<Scalars['String']['input']>;
  threshold: Scalars['Float']['input'];
};

/** Where the numbers came from. */
export type DataSource =
  /** Live data from the U.S. Energy Information Administration API */
  | 'EIA'
  /** Built-in synthetic data used when no EIA_API_KEY is set. Not real prices. */
  | 'SAMPLE';

export type DateRange = {
  /** Inclusive start date (same format as PricePoint.date) */
  from?: InputMaybe<Scalars['String']['input']>;
  /** Inclusive end date */
  to?: InputMaybe<Scalars['String']['input']>;
};

/** How often a series is sampled. */
export type Frequency =
  | 'DAILY'
  | 'MONTHLY'
  | 'WEEKLY';

export type Mutation = {
  __typename?: 'Mutation';
  createAlert: PriceAlert;
  /** Returns true if an alert was removed. */
  deleteAlert: Scalars['Boolean']['output'];
};


export type MutationCreateAlertArgs = {
  input: CreateAlertInput;
};


export type MutationDeleteAlertArgs = {
  id: Scalars['ID']['input'];
};

/** A user-defined price alert. Stored in memory, so it resets when the server restarts. */
export type PriceAlert = {
  __typename?: 'PriceAlert';
  commodity: CommodityInfo;
  createdAt: Scalars['String']['output'];
  /** The latest price this alert was checked against. */
  currentPrice?: Maybe<Scalars['Float']['output']>;
  direction: AlertDirection;
  id: Scalars['ID']['output'];
  note?: Maybe<Scalars['String']['output']>;
  threshold: Scalars['Float']['output'];
  /** Computed on every request: is the latest price past the threshold? */
  triggered: Scalars['Boolean']['output'];
};

/** A single observation: a date and a price. */
export type PricePoint = {
  __typename?: 'PricePoint';
  /** ISO date (YYYY-MM-DD for daily/weekly, YYYY-MM for monthly) */
  date: Scalars['String']['output'];
  value: Scalars['Float']['output'];
};

/**
 * A time series of prices. Notice that `points`, `latest` and `stats` are
 * fields with their own resolvers — the client only pays for what it asks for.
 */
export type PriceSeries = {
  __typename?: 'PriceSeries';
  commodity: CommodityInfo;
  frequency: Frequency;
  latest?: Maybe<PricePoint>;
  /** Points in ascending date order. Use `last` to take only the most recent N. */
  points: Array<PricePoint>;
  source: DataSource;
  stats?: Maybe<SeriesStats>;
};


/**
 * A time series of prices. Notice that `points`, `latest` and `stats` are
 * fields with their own resolvers — the client only pays for what it asks for.
 */
export type PriceSeriesPointsArgs = {
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  alerts: Array<PriceAlert>;
  /** Every commodity the API supports. */
  commodities: Array<CommodityInfo>;
  /** A price series for one commodity. */
  series: PriceSeries;
  /** Price difference between two commodities, e.g. the Brent–WTI spread. */
  spread: Spread;
};


export type QuerySeriesArgs = {
  commodity: Commodity;
  frequency?: InputMaybe<Frequency>;
  range?: InputMaybe<DateRange>;
};


export type QuerySpreadArgs = {
  a: Commodity;
  b: Commodity;
  frequency?: InputMaybe<Frequency>;
  range?: InputMaybe<DateRange>;
};

/** Summary statistics over a set of points. */
export type SeriesStats = {
  __typename?: 'SeriesStats';
  /** Last value minus first value */
  change: Scalars['Float']['output'];
  /** Change as a percentage of the first value */
  changePercent: Scalars['Float']['output'];
  count: Scalars['Int']['output'];
  max: Scalars['Float']['output'];
  mean: Scalars['Float']['output'];
  min: Scalars['Float']['output'];
};

/** The difference between two commodities on matching dates (a minus b). */
export type Spread = {
  __typename?: 'Spread';
  a: CommodityInfo;
  b: CommodityInfo;
  frequency: Frequency;
  points: Array<PricePoint>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AlertDirection: AlertDirection;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Commodity: Commodity;
  CommodityInfo: ResolverTypeWrapper<CommodityInfo>;
  CreateAlertInput: CreateAlertInput;
  DataSource: DataSource;
  DateRange: DateRange;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Frequency: Frequency;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  PriceAlert: ResolverTypeWrapper<AlertModel>;
  PricePoint: ResolverTypeWrapper<PricePoint>;
  PriceSeries: ResolverTypeWrapper<SeriesModel>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  SeriesStats: ResolverTypeWrapper<SeriesStats>;
  Spread: ResolverTypeWrapper<SpreadModel>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  CommodityInfo: CommodityInfo;
  CreateAlertInput: CreateAlertInput;
  DateRange: DateRange;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: Record<PropertyKey, never>;
  PriceAlert: AlertModel;
  PricePoint: PricePoint;
  PriceSeries: SeriesModel;
  Query: Record<PropertyKey, never>;
  SeriesStats: SeriesStats;
  Spread: SpreadModel;
  String: Scalars['String']['output'];
};

export type CommodityInfoResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['CommodityInfo'] = ResolversParentTypes['CommodityInfo']> = {
  eiaSeriesId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Commodity'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  unit?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type MutationResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createAlert?: Resolver<ResolversTypes['PriceAlert'], ParentType, ContextType, RequireFields<MutationCreateAlertArgs, 'input'>>;
  deleteAlert?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteAlertArgs, 'id'>>;
};

export type PriceAlertResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['PriceAlert'] = ResolversParentTypes['PriceAlert']> = {
  commodity?: Resolver<ResolversTypes['CommodityInfo'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currentPrice?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  direction?: Resolver<ResolversTypes['AlertDirection'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  note?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  threshold?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  triggered?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type PricePointResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['PricePoint'] = ResolversParentTypes['PricePoint']> = {
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
};

export type PriceSeriesResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['PriceSeries'] = ResolversParentTypes['PriceSeries']> = {
  commodity?: Resolver<ResolversTypes['CommodityInfo'], ParentType, ContextType>;
  frequency?: Resolver<ResolversTypes['Frequency'], ParentType, ContextType>;
  latest?: Resolver<Maybe<ResolversTypes['PricePoint']>, ParentType, ContextType>;
  points?: Resolver<Array<ResolversTypes['PricePoint']>, ParentType, ContextType, Partial<PriceSeriesPointsArgs>>;
  source?: Resolver<ResolversTypes['DataSource'], ParentType, ContextType>;
  stats?: Resolver<Maybe<ResolversTypes['SeriesStats']>, ParentType, ContextType>;
};

export type QueryResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  alerts?: Resolver<Array<ResolversTypes['PriceAlert']>, ParentType, ContextType>;
  commodities?: Resolver<Array<ResolversTypes['CommodityInfo']>, ParentType, ContextType>;
  series?: Resolver<ResolversTypes['PriceSeries'], ParentType, ContextType, RequireFields<QuerySeriesArgs, 'commodity' | 'frequency'>>;
  spread?: Resolver<ResolversTypes['Spread'], ParentType, ContextType, RequireFields<QuerySpreadArgs, 'a' | 'b' | 'frequency'>>;
};

export type SeriesStatsResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['SeriesStats'] = ResolversParentTypes['SeriesStats']> = {
  change?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  changePercent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  max?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  mean?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  min?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
};

export type SpreadResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Spread'] = ResolversParentTypes['Spread']> = {
  a?: Resolver<ResolversTypes['CommodityInfo'], ParentType, ContextType>;
  b?: Resolver<ResolversTypes['CommodityInfo'], ParentType, ContextType>;
  frequency?: Resolver<ResolversTypes['Frequency'], ParentType, ContextType>;
  points?: Resolver<Array<ResolversTypes['PricePoint']>, ParentType, ContextType>;
};

export type Resolvers<ContextType = AppContext> = {
  CommodityInfo?: CommodityInfoResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PriceAlert?: PriceAlertResolvers<ContextType>;
  PricePoint?: PricePointResolvers<ContextType>;
  PriceSeries?: PriceSeriesResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SeriesStats?: SeriesStatsResolvers<ContextType>;
  Spread?: SpreadResolvers<ContextType>;
};

