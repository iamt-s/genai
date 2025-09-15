import { GraphQLClient } from 'graphql-request';
import { gql } from 'graphql-request';

const endpoint = 'YOUR_GRAPHQL_ENDPOINT'; // Replace with your GraphQL endpoint
const client = new GraphQLClient(endpoint);

describe('GraphQL Schema Changes', () => {

  // Breaking Change: Removal of Query.hello

  it('should fail when querying the removed hello field', async () => {
    const query = gql`
      query {
        hello
      }
    `;

    try {
      await client.request(query);
      fail('Query should have failed'); // Force a failure if the query succeeds
    } catch (error: any) {
      expect(error.message).toContain('Cannot query field "hello" on type "Query"'); // Check for the correct error message
    }
  });

  // Non-Breaking Changes: Additions of new types and fields

  it('should successfully query the new continents field', async () => {
    const query = gql`
      query {
        continents {
          code
          name
        }
      }
    `;

    try {
      const data = await client.request(query);
      expect(data).toBeDefined();
      expect(data.continents).toBeInstanceOf(Array);

      //Add check that each item has `code` and `name` to prevent regression.
      if(data.continents.length > 0){
        expect(data.continents[0]).toHaveProperty('code');
        expect(data.continents[0]).toHaveProperty('name');
      }

    } catch (error) {
      console.error('Error querying continents:', error);
      fail('Query should not have failed');
    }
  });

  it('should successfully query the new continent field with a code argument', async () => {
    const query = gql`
      query GetContinent($code: String!) {
        continent(code: $code) {
          code
          name
        }
      }
    `;

    const variables = {
      code: 'AF', // Example continent code
    };

    try {
      const data = await client.request(query, variables);
      expect(data).toBeDefined();
      expect(data.continent).toBeDefined();
      expect(data.continent?.code).toBeDefined();
      expect(data.continent?.name).toBeDefined();
    } catch (error) {
      console.error('Error querying continent:', error);
      fail('Query should not have failed');
    }
  });

    it('should successfully query the new countries field', async () => {
    const query = gql`
      query {
        countries {
          code
          name
        }
      }
    `;

    try {
      const data = await client.request(query);
      expect(data).toBeDefined();
      expect(data.countries).toBeInstanceOf(Array);

      if(data.countries.length > 0){
        expect(data.countries[0]).toHaveProperty('code');
        expect(data.countries[0]).toHaveProperty('name');
      }
    } catch (error) {
      console.error('Error querying countries:', error);
      fail('Query should not have failed');
    }
  });

    it('should successfully query the new country field with a code argument', async () => {
    const query = gql`
      query GetCountry($code: String!) {
        country(code: $code) {
          code
          name
        }
      }
    `;

    const variables = {
      code: 'CA', // Example country code
    };

    try {
      const data = await client.request(query, variables);
      expect(data).toBeDefined();
      expect(data.country).toBeDefined();
      expect(data.country?.code).toBeDefined();
      expect(data.country?.name).toBeDefined();
    } catch (error) {
      console.error('Error querying country:', error);
      fail('Query should not have failed');
    }
  });

    it('should successfully query the new languages field', async () => {
    const query = gql`
      query {
        languages {
          code
          name
        }
      }
    `;

    try {
      const data = await client.request(query);
      expect(data).toBeDefined();
      expect(data.languages).toBeInstanceOf(Array);
      if(data.languages.length > 0){
        expect(data.languages[0]).toHaveProperty('code');
        expect(data.languages[0]).toHaveProperty('name');
      }
    } catch (error) {
      console.error('Error querying languages:', error);
      fail('Query should not have failed');
    }
  });

    it('should successfully query the new language field with a code argument', async () => {
    const query = gql`
      query GetLanguage($code: String!) {
        language(code: $code) {
          code
          name
        }
      }
    `;

    const variables = {
      code: 'EN', // Example language code
    };

    try {
      const data = await client.request(query, variables);
      expect(data).toBeDefined();
      expect(data.language).toBeDefined();
      expect(data.language?.code).toBeDefined();
      expect(data.language?.name).toBeDefined();
    } catch (error) {
      console.error('Error querying language:', error);
      fail('Query should not have failed');
    }
  });


  // Edge Case for continent: Invalid Continent Code

  it('should handle the continent query gracefully with an invalid code', async () => {
    const query = gql`
      query GetContinent($code: String!) {
        continent(code: $code) {
          code
          name
        }
      }
    `;

    const variables = {
      code: 'ZZ', // Invalid continent code
    };

    try {
      const data = await client.request(query, variables);
      expect(data).toBeDefined();
      // Depending on your server's implementation, you might expect:
      // 1. data.continent to be null/undefined, OR
      // 2. An error to be thrown.
      // Adjust the expectation accordingly.
      expect(data.continent).toBeNull();  // Or expect(data.continent).toBeUndefined();

    } catch (error) {
      console.error('Error querying continent:', error);
      fail('Query should not have failed');
    }
  });

    // Edge Case for country: Invalid Country Code

    it('should handle the country query gracefully with an invalid code', async () => {
        const query = gql`
          query GetCountry($code: String!) {
            country(code: $code) {
              code
              name
            }
          }
        `;

        const variables = {
          code: 'ZZ', // Invalid country code
        };

        try {
          const data = await client.request(query, variables);
          expect(data).toBeDefined();
          expect(data.country).toBeNull();

        } catch (error) {
          console.error('Error querying country:', error);
          fail('Query should not have failed');
        }
      });
});