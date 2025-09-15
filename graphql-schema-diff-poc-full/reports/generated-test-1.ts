import { GraphQLClient } from 'graphql-request';
import { gql } from 'graphql-request';

const endpoint = 'YOUR_GRAPHQL_ENDPOINT'; // Replace with your GraphQL endpoint
const client = new GraphQLClient(endpoint);

describe('GraphQL Schema Changes', () => {

  describe('Breaking Changes', () => {
    it('should return an error when querying the removed "hello" field', async () => {
      const query = gql`
        query {
          hello
        }
      `;

      try {
        await client.request(query);
      } catch (error: any) {
        expect(error.message).toContain('Cannot query field "hello" on type "Query"'); // Or a similar error message based on your server
        return; // Exit the test if an error occurred.
      }

      // If no error was thrown, the test should fail
      throw new Error('Expected an error to be thrown, but none was.');
    });

    it('should not return an error if the removed "hello" field is not queried', async () => {
      const query = gql`
        query {
          countries {
            code
          }
        }
      `;

      try {
        await client.request(query);
        // If the query succeeds, the test passes
      } catch (error: any) {
        // If any error was thrown, the test should fail
        throw new Error(`Query should not have failed but got error: ${error.message}`);
      }

    });
  });


  describe('Non-Breaking Changes', () => {
    it('should successfully query the new "continents" field', async () => {
      const query = gql`
        query {
          continents {
            code
            name
          }
        }
      `;

      const data = await client.request(query);
      expect(data.continents).toBeDefined();
      // Add more specific checks on the data if you have test data available
    });

    it('should successfully query the new "continent" field with a code argument', async () => {
      const query = gql`
        query {
          continent(code: "EU") {
            code
            name
          }
        }
      `;

      const data = await client.request(query);
      expect(data.continent).toBeDefined();
      // Add more specific checks on the data if you have test data available
    });

    it('should successfully query the new "countries" field', async () => {
      const query = gql`
        query {
          countries {
            code
            name
          }
        }
      `;

      const data = await client.request(query);
      expect(data.countries).toBeDefined();
      // Add more specific checks on the data if you have test data available
    });

    it('should successfully query the new "country" field with a code argument', async () => {
      const query = gql`
        query {
          country(code: "CA") {
            code
            name
          }
        }
      `;

      const data = await client.request(query);
      expect(data.country).toBeDefined();
      // Add more specific checks on the data if you have test data available
    });

      it('should successfully query the new "languages" field', async () => {
        const query = gql`
          query {
            languages {
              code
              name
            }
          }
        `;

        const data = await client.request(query);
        expect(data.languages).toBeDefined();
        // Add more specific checks on the data if you have test data available
      });

      it('should successfully query the new "language" field with a code argument', async () => {
        const query = gql`
          query {
            language(code: "EN") {
              code
              name
            }
          }
        `;

        const data = await client.request(query);
        expect(data.language).toBeDefined();
        // Add more specific checks on the data if you have test data available
      });

  });
});