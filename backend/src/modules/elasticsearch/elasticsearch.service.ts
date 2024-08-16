import { Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';

@Injectable()
export class ElasticsearchService {
  private client: Client;

  constructor() {
    this.client = new Client({ node: 'http://elasticsearch:9200' }); // Use the appropriate URL for your Elasticsearch instance
  }

  async indexItem(index: string, id: string, body: any) {
    await this.client.index({
      index,
      id,
      body,
    });
  }
  async searchItems(index: string, query: any): Promise<any[]> {
    try {
      const result: SearchResponse<any> = await this.client.search({
        index,
        ...query, // Use the spread operator to apply query parameters
      });

      // Directly access the hits without `body`
      return result.hits.hits;
    } catch (error) {
      throw error;
    }
  }
}
