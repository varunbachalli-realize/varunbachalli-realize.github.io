class SubTypeSearchQueryGenerator extends SearchQueryGenerator
{
    GetSearchString() 
    {
        return "";
    }

    CloneDefault()
    {
        return new SubTypeSearchQueryGenerator(this.subtypeId);
    }

    constructor(subtypeId){
        super();
        this.subtypeId = subtypeId;
        this.AddSubTypeFilter(this.subtypeId);
    }

    GenerateBasicSearchObject()
    {
        let filterConditions = this.GetFilterConditions();
        return {
            "query" : {
                "bool" : {
                    "filter" : filterConditions
                }
            }
        };
    }

    GenerateJson(start, numItems)
    {
        let json_object = this.GenerateBasicSearchObject();

        this.AddSortingType(SortingTypes.PriceLowToHigh);
        let sortingJson = GetSortingOrderDict(this.sortingType);
        if(sortingJson != null)
        {
            json_object = {...json_object, ...sortingJson};
        }

        json_object = { ...json_object,
                        ...GetPaginationDict(start, numItems),
                        ...GetSourceItemsDict()};
        
        return JSON.stringify(json_object);
    }

    GenerateAggregationJson(){
        let jsonObject = this.GenerateBasicSearchObject(); 

        jsonObject = {  
                        "_source" : false,
                        ...jsonObject,
                        ...GetPaginationDict(0, 0),
                        ...GetAggregationsConditions(true) 
                    };

        return JSON.stringify(jsonObject);
    }

}