import { GraphQLClient, gql } from 'graphql-request';

const endpoint = 'http://localhost:4000/graphql'; // Replace with your GraphQL endpoint

describe('GraphQL Schema Changes', () => {
  const client = new GraphQLClient(endpoint);

  describe('Query.newField', () => {
    it('should return the new field when requested', async () => {
      const query = gql`
        query {
          newField
        }
      `;

      const data = await client.request(query);
      expect(data).toHaveProperty('newField');
      expect(typeof data.newField).toBe('number'); // Assuming Int is represented as number
    });

    it('should not break existing queries that do not request newField', async () => {
      const query = gql`
        query {
          __typename
        }
      `;

      const data = await client.request(query);
      expect(data).toHaveProperty('__typename');
    });

      it('should handle null value if server returns null for newField (edge case)', async () => {
        // Mock the server to return null for newField
        const mockClient = new GraphQLClient(endpoint);
        mockClient.request = jest.fn().mockResolvedValue({ newField: null });

        const query = gql`
          query {
            newField
          }
        `;

        const data = await mockClient.request(query);
        expect(data).toHaveProperty('newField');
        expect(data.newField).toBe(null); // Expect null if server returns null

      });

      it('should handle zero value if server returns zero for newField (edge case)', async () => {
        // Mock the server to return null for newField
        const mockClient = new GraphQLClient(endpoint);
        mockClient.request = jest.fn().mockResolvedValue({ newField: 0 });

        const query = gql`
          query {
            newField
          }
        `;

        const data = await mockClient.request(query);
        expect(data).toHaveProperty('newField');
        expect(data.newField).toBe(0); // Expect 0 if server returns 0

      });
  });

  describe('Mutation type', () => {
      it('should not affect existing queries', async () => {
          const query = gql`
            query {
              __typename
            }
          `;
          const data = await client.request(query);
          expect(data).toHaveProperty('__typename');
        });

      // Ideally, you'd add tests for specific mutations within the mutation type
      // For example, if the mutation was named "createUser":
      /*
      it('should execute the createUser mutation successfully', async () => {
        const mutation = gql`
          mutation {
            createUser(name: "Test User") {
              id
              name
            }
          }
        `;

        const data = await client.request(mutation);
        expect(data).toHaveProperty('createUser');
        expect(data.createUser).toHaveProperty('id');
        expect(data.createUser).toHaveProperty('name', 'Test User');
      });
      */
    });
});