class FreeTextSearchQueryGenerator extends SearchQueryGenerator
{
    GetSearchString() 
    {
        return this.searchString;
    }

    CloneDefault()
    {
        return new FreeTextSearchQueryGenerator(this.searchString);
    }

    constructor(free_text){
        super();
        this.searchString = free_text;
    }

    MultiMatchConditions(boosting = null){
        if(boosting == null)
        {
            return {
                "multi_match" :{
                        "query" : this.searchString,
                        "fuzziness" : 1
                    }
            };
        }
        else{
            return {
                "multi_match" :{
                        "query" : this.searchString,
                        "fuzziness" : 1,
                        "fields" : boosting
                    }
            };
        }
    }

    MultiMatchInVariants()
    {
        let variantMatch = [this.MultiMatchConditions(
                                                        [
                                                            "variants.subtype^10",
                                                            "variants.maintype^20",
                                                            "variants.category_name",
                                                            "variants.description",
                                                            "variants.variant_properties"
                                                        ]
                                                    )];

        return {
            "nested" : 
            {
                "path" : "variants",
                "inner_hits" : GetVariantSourceItemsJson(),
                "query" : 
                {
                    "bool" : 
                    {
                        "must" : variantMatch
                    }
                }
            }
        };
    }

    GenerateBasicSearchObject()
    {
        let multiMatchInParent = this.MultiMatchConditions([
                                                                "name^2",
                                                                "retailer^10",
                                                                "variants.subtype^10",
                                                                "variants.maintype^20",
                                                                "variants.category_name",
                                                                "variants.description",
                                                                "variants.variant_properties"
                                                            ]);
        let shouldConditions = [
            multiMatchInParent,
            this.MultiMatchInVariants()
        ];

        let filterConditions = this.GetFilterConditions();
        return {
            "query" : {
                "bool" : {
                    "filter" : filterConditions,
                    "should" : shouldConditions
                }
            }
        };
    }

    GenerateJson(start, numItems)
    {
        let json_object = this.GenerateBasicSearchObject();
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
                        ...GetAggregationsConditions() 
                    };

        return JSON.stringify(jsonObject);
    }

}