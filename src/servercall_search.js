class SearchServerCall
{
    // TODO : these permissions only allow search, they don't have direct access to alter db. 
    // so it's not really too bad.
    // i've already tested it with an intermediate lambda function + rest api gateway on aws and it slows things down really badly.  
    // but they can potentially shoot up our aws cost.
    // i'm not sure what the solution is, have to do some googling, to get it.
    get Authentication()
    {
        return "Basic "+ btoa("realize-user:fofsyt-xedwaq-siqmA0");
    }

    constructor()
    {
      this.url = 'https://search-realize-search-service-ctrddchc7mpvfm2vm7nld44yu4.us-east-2.es.amazonaws.com/realize_search/_search';
      this.headers = {
        'Content-Type': 'application/json',
        'Authorization': "Basic "+ btoa("realize-user:fofsyt-xedwaq-siqmA0")
      };
      
    }

    parseResponse(response)
    {   
        let searchResults = [];
        let response_hits = response.hits;
        if(!response_hits) 
        {
            return searchResults;
        }
        if(response_hits.total.value != 0){
            let found_hits = response_hits.hits;
            for(let i = 0; i < found_hits.length; ++i)
            {
                searchResults.push(found_hits[i]._source);
            }
        }

        return [searchResults, response.hits.total.value];
    }

    async getSearchResultsFor(string_Json)
    {
        let response = await this.callServerForSearchResults(string_Json);
        if(response == null)
        {
            return [];  
        }
        let searchResults = this.parseResponse(response);
        return searchResults;
    }

    async callServerForSearchResults(body)
    {
        let response = await fetch(this.url, 
        {
          method: 'POST',
          headers: this.headers,
          body: body
        });
        if(response.ok){
            return response.json();
        }
        else{
            return null;
        }
    }
    
    getKeyIdsFromList(ids){
      let l = [];
      for(let i = 0; i < ids.length; ++i){
        l.push(ids[i].key);
      }
      return l;
    }

    getPercentageValuesFromDict(dict){
      return {
        "min" : dict['10.0'],
        "max" : dict['90.0']
      }
    }
    getRetailersFromResponse(response){
      return this.getKeyIdsFromList(response.aggregations.retailers.buckets);
    }

    getSubTypesFromResponse(response){
      if(response.aggregations.variant_aggs.subtypes){
        return this.getKeyIdsFromList(response.aggregations.variant_aggs.subtypes.buckets);
      }
      return [];
    }

    getPricesFromResponse(response){
      return this.getPercentageValuesFromDict(response.aggregations.price_percentiles.values);
    }

    getWidthsFromResponse(response){
      return this.getPercentageValuesFromDict(response.aggregations.variant_aggs.variants_width.width_percentiles.values);
    }

    getDepthsFromResponse(response){
      return this.getPercentageValuesFromDict(response.aggregations.variant_aggs.variants_length.length_percentiles.values);
    }

    getHeightsFromResponse(response){
      return this.getPercentageValuesFromDict(response.aggregations.variant_aggs.variants_height.height_percentiles.values);
    }

    parseAggregationResponse(response){
      return {
        "retailers" : this.getRetailersFromResponse(response),
        "subtypes" : this.getSubTypesFromResponse(response),
        "price" : this.getPricesFromResponse(response),
        "width" : this.getWidthsFromResponse(response),
        "depth" : this.getDepthsFromResponse(response),
        "height" : this.getHeightsFromResponse(response)
      };
    }
    async getAggregationResponseFor(string_json){
      let response = await this.callServerForSearchResults(string_json);

      if(response == null)
      {
        return [];
      }

      return this.parseAggregationResponse(response);
    }

      
}