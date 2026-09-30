/**
 * Every GraphQL operation the web app uses, in one place.
 *
 * `graphql()` is GENERATED (see codegen.ts). Once codegen has seen a query
 * string here, it knows the exact result + variables types for it, so
 * `useQuery(SeriesQuery)` returns fully-typed `data` with no manual typing.
 */
import { graphql } from "../gql";

export const CommoditiesQuery = graphql(`
  query Commodities {
    commodities {
      id
      name
      unit
    }
  }
`);

export const DashboardQuery = graphql(`
  query Dashboard($commodity: Commodity!, $frequency: Frequency!, $range: DateRange) {
    series(commodity: $commodity, frequency: $frequency, range: $range) {
      source
      commodity {
        id
        name
        unit
        eiaSeriesId
      }
      latest {
        date
        value
      }
      stats {
        count
        min
        max
        mean
        change
        changePercent
      }
      points {
        date
        value
      }
    }
  }
`);

export const SpreadQuery = graphql(`
  query BrentWtiSpread($frequency: Frequency!, $range: DateRange) {
    spread(a: BRENT, b: WTI, frequency: $frequency, range: $range) {
      points {
        date
        value
      }
    }
  }
`);

export const AlertsQuery = graphql(`
  query Alerts {
    alerts {
      id
      direction
      threshold
      note
      triggered
      currentPrice
      commodity {
        id
        name
        unit
      }
    }
  }
`);

export const CreateAlertMutation = graphql(`
  mutation CreateAlert($input: CreateAlertInput!) {
    createAlert(input: $input) {
      id
    }
  }
`);

export const DeleteAlertMutation = graphql(`
  mutation DeleteAlert($id: ID!) {
    deleteAlert(id: $id)
  }
`);
