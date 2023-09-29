class AutoCompleteServerCall
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
      this.url = 'https://search-realize-search-service-ctrddchc7mpvfm2vm7nld44yu4.us-east-2.es.amazonaws.com/realize_suggest/_search';
      this.headers = {
        'Content-Type': 'application/json',
        'Authorization': "Basic "+ btoa("realize-user:fofsyt-xedwaq-siqmA0")
      };
      
    }
    
    // this query exludes auto complete entries that are extracted from furniture names.
    // it includes autocomplete entries that are from retailers, subtypes, types, and custom entries.
    getQueryForNonNameType(word)
    {   
        return {
            "size" : 10,
            "query": {
              "bool": {
                "should": 
                [
                  {
                    "term": 
                    {
                      "is_externally_added": true
                    }
                  },
                  {
                    "terms": {
                      "suggestion_type.keyword": 
                      [
                        "subtype",
                        "type",
                        "retailer"
                      ]
                    }
                  }
                  ],
                  "must": [
                    {
                      "match" : {
                        "suggestion": word
                      }
                    }
                  ],
                  "minimum_should_match": 1
              }
            }
          };
    }

    getQueryForNameType(word)
    {
        return {
            "size" : 10,
            "query" : 
            {
                "match" : 
                {
                    "suggestion" : 
                    {
                        "query" : word,
                        "fuzziness" : 1
                    }
                }
            }
        };
    }


    parseResponse(response)
    {   
        let suggestions = [];
        let response_hits = response.hits;
        if(!response_hits) 
        {
            console.log( "tis shit");
            return [];
        }
        if(response_hits.total.value != 0){
            let found_hits = response_hits.hits;
            for(let i = 0; i < found_hits.length; ++i)
            {
                suggestions.push(found_hits[i]._source);
            }
        }

        return suggestions;
    }

    async getAutoCompleteResultsFor(word)
    {
        let query = this.getQueryForNonNameType(word);
        let response = await this.callServerForResults(query);
        if(response == null)
        {
            return [];  
        }
        let suggestions = this.parseResponse(response);
        if(suggestions.length == 0)
        {
            query = this.getQueryForNameType(word);
            let response = await this.callServerForResults(query);
            if(response == null)
            {
                return [];
            }
            suggestions = this.parseResponse(response);
        }
        return suggestions;
    }

    async callServerForResults(body)
    {
        let response = await fetch(this.url, 
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(body)
        });
        if(response.ok){
            return response.json();
        }
        else{
            return null;
        }
      }
}