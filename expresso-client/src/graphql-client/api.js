import gql from 'graphql-tag';
import client from './client';

export const getBrand = async (name, domain) => {
  try {
    return await client.query({
      variables: { name, domain },
      query: gql`
        query($name: String!, $domain: DomainEnum) {
          getBrand(name: $name, domain: $domain) {
            totalCmt
            rate {
              average
              detail {
                rate
                domain
                totalCmt
              }
              rateCount {
                star
                totalCmt
              }
            }
          }
        }
      `,
    });
  } catch (err) {
    return err;
  }
};

export const getComments = async ({
  offset,
  brand,
  star,
  domain,
  sort,
  keyword,
}) => {
  try {
    return await client.query({
      variables: { offset, brand, star, sort, domain, keyword },
      query: gql`
        query(
          $offset: Int!
          $brand: String
          $star: String
          $sort: SortEnum
          $domain: DomainEnum
          $keyword: String
        ) {
          getComments(
            offset: $offset
            brand: $brand
            sort: $sort
            star: $star
            domain: $domain
            keyword: $keyword
          ) {
            id
            author
            content
            rate
            date
            product {
              source {
                url
              }
            }
          }
        }
      `,
    });
  } catch (err) {
    return err;
  }
};

export const getHistogram = async ({
  brandName,
  from,
  to,
  interval,
  domain,
}) => {
  try {
    return await client.query({
      variables: { brandName, from, to, interval, domain },
      query: gql`
        query(
          $brandName: String!
          $from: String!
          $to: String!
          $interval: Int!
          $domain: DomainEnum
        ) {
          brandHistogram(
            brandName: $brandName
            from: $from
            to: $to
            interval: $interval
            domain: $domain
          ) {
            timestamp
            total
            count {
              positive
              negative
            }
          }
        }
      `,
    });
  } catch (err) {
    return err;
  }
};

export const getTopWords = async (size) => {
  try {
    return await client.query({
      variables: { size },
      query: gql`
        query($size: Int!) {
          getWords(size: $size) {
            text
            value
          }
        }
      `,
    });
  } catch (err) {
    return err;
  }
};
