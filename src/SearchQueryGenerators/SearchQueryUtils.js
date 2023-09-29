function GetSortingOrderDict(sortingOrder){
    switch (sortingOrder)
    {
        case SortingTypes.PriceLowToHigh:
            return {
                        "sort" : {
                            "price" : 
                            {
                                "order" : "asc"
                            }
                        }
                    };
        case SortingTypes.PriceHighToLow:
            return {
                "sort" : 
                {
                    "price" : 
                    {
                        "order" : "desc"
                    }
                }
            };
        case SortingTypes.SizeLargeToSmall:
            return {
                "sort" : 
                {
                    "area" : 
                    {
                        "order" : "desc"
                    }
                }
            };
        case SortingTypes.SizeSmallToLarge:
            return {
                "sort" : 
                {
                    "area" : 
                    {
                        "order" : "asc"
                    }
                }
            };
        case SortingTypes.SoonestDelivery:
            throw new System.NotImplementedException();
        case SortingTypes.AToZ:
            return {
                "sort" : 
                {
                    "name.keyword" : 
                    {
                        "order" : "asc"
                    }
                }
            };
        case SortingTypes.ZToA:
            return {
                "sort" : 
                {
                    "name.keyword" : 
                    {
                        "order" : "desc"
                    }
                }
            };
        case SortingTypes.Newest:
            throw new Error("Not implemented!");
        case SortingTypes.MostPopular:
            throw new Error("Not implemented!");
    }
    return null;
}
function GetSourceItemsDict()
{
    return {
        "_source" : ["id" , "name", "price"]
    };
}
function GetPaginationDict(start, count)
{
    return {
        "from" : start,
        "size" : count
    };
}

function GetRetailerMatchFilter(RetailerName)
{
    return {
        "match" : {
            "retailer" : RetailerName
        }
    };
}

function GetMatchTypeString(t)
{
    switch (t)
    {
        case AutoSuggestType.subtype:
            {
                return "variants.subtype";
            }
        case AutoSuggestType.type:{
            return "variants.maintype";
        }
        case AutoSuggestType.retailer:
            {
                return "retailer";
            }
        case AutoSuggestType.item:
            {
                return "name";
            }
    }
    return "";
}

function GetMatchId(widget)
{
    if (widget.MatchType == AutoSuggestType.subtype) 
    {
        return widget.entry.subtype_ids.length > 0? widget.entry.subtype_ids[0] : "";
    }
    if (widget.MatchType == AutoSuggestType.type) 
    {
        return widget.entry.maintype_id.length > 0? widget.entry.maintype_id[0] : "";
    }
    if (widget.MatchType == AutoSuggestType.retailer) 
    {
        return widget.entry.retailer_id.length > 0? widget.entry.retailer_id[0] : "";
    }
    if (widget.MatchType == AutoSuggestType.item) 
    {
        return widget.entry.id.length > 0? widget.entry.id[0] : "";
    }
    return "-1";
}
function GetMatchText(widget)
{
    if (widget.MatchType == AutoSuggestType.subtype) 
    {
        return widget.entry.subtype.length > 0? widget.entry.subtype[0] : "";
    }
    if (widget.MatchType == AutoSuggestType.type) 
    {
        return widget.entry.maintype.length > 0? widget.entry.maintype[0] : "";
    }
    if (widget.MatchType == AutoSuggestType.retailer) 
    {
        return widget.entry.retailer.length > 0? widget.entry.retailer[0] : "";
    }
    if (widget.MatchType == AutoSuggestType.item) 
    {
        return widget.entry.name.length > 0? widget.entry.name[0] : "";
    }
    return "";
} 


function GetSimpleNameMatch(name)
{
    return [
                {
                    "match" : 
                    {
                        "name" : 
                        {
                            "query" : name,
                            "boost" : 10,
                            "fuzziness" : 2
                        }
                    }
                },
                {
                    "match_phrase" : 
                    {
                        "name" : 
                        {
                            "query" : name,
                            "boost" : 20
                        }
                    }
                }
            ];
}

variant_match_number = 0;
function GetVariantSourceItemsJson(){
    j = {
        "name" : "innerHits_name_"+ variant_match_number,
        "_source" : ["variants.id"]
    };
    variant_match_number += 1; 
    if(variant_match_number < 0)
    { // overflow condition check!
        variant_match_number = 0;
    }

    return j;
}
function GetNameMatchFilter(name)
{
    array = [];
    array = GetSimpleNameMatch(name);
    array.push( {
            "nested" :
            {
                "path" : "variants",
                "inner_hits" : GetVariantSourceItemsJson(),
                "query" :
                {
                    "bool" :
                    {
                        "should" :
                        [
                            {
                                "match" :
                                {
                                    "variants.variant_properties" : name
                                }
                            },
                            {
                                "match" :
                                {
                                    "variants.description" : name
                                }
                            }
                        ]
                    }
                }
            }
        });
    
    return array;
}



function GetTypeOrSubTypeMatchFilter(matchType, matchText)
{
    let matchtypestring = GetMatchTypeString(matchType);
    return {
        "nested" : 
        {
            "path" : "variants",
            "inner_hits" : GetVariantSourceItemsJson(),
            "query" : 
            {
                "match" : 
                {
                    [matchtypestring] : matchText
                }
            }
        }
    };
}

function GetSubTypeAndTypeMatchFilter(subtypeText, typeText)
{
    return {
        "nested":
        {
            "path" : "variants",
            "inner_hits" : GetVariantSourceItemsJson(),
            "query": {
                "bool":
                {
                    "should" : [
                        {
                            "match":
                            {
                                "variants.subtype" : 
                                {
                                    "query" : subtypeText,
                                    "boost" : 30 
                                }
                            }
                        },
                        {
                            "match":
                            {
                                "variants.maintype" : 
                                {
                                    "query" : typeText,
                                    "boost" : 10
                                }
                            }
                        }
                    ]
                }
            }
        }
    };
}

function GetRangeFilterObject(name, min ,max)
{
    if(max == -1)
    {
        return {
            "range" :
            {
                [name] :
                {
                    "gte" : min
                }
            }
        };
    }
    return {
        "range" :
        {
            [name] :
            {
                "gte" : min,
                "lte" : max
            }
        }
    };
}

function GetAggregationsConditions(IsSubtypeAgg = false)
{
    let ranges = [10, 90]; // 10th percentile and 90th percentile
    let widthAggs = {
        "variants_width" :
        {
            "filter" :
            {
                "range" :
                {
                    "variants.width" :
                    {
                        "gte" : 0
                    }
                }
            },
            "aggs" :
            {
                "width_percentiles" :
                {
                    "percentiles" :
                    {
                        "field" : "variants.width",
                        "percents" : ranges
                    }
                }
            }
        }
    };

    let heightAggs = {
        "variants_height" :
        {
            "filter" :
            {
                "range" :
                {
                    "variants.height" :
                    {
                        "gte" : 0
                    }
                }
            },
            "aggs" :
            {
                "height_percentiles" :
                {
                    "percentiles" :
                    {
                        "field" : "variants.height",
                        "percents" : ranges
                    }
                }
            }
        }
    };

    let depthAggs ={
        "variants_length" :
                    {
                        "filter" :
                        {
                            "range" :
                            {
                                "variants.length" :
                                {
                                    "gte" : 0
                                }
                            }
                        },
                        "aggs" :
                        {
                            "length_percentiles" :
                            {
                                "percentiles" :
                                {
                                    "field" : "variants.length",
                                    "percents" : ranges
                                }
                            }
                        }
                    }
    };

    let subtypeAggs = {
        "subtypes" :
        {
            "terms" :
            {
                "field" : "variants.subtype_id",
                "size" : 20
            }
        }
    };

    let variant_aggs = {...widthAggs, ...heightAggs , ...depthAggs};
    if(!IsSubtypeAgg){
        variant_aggs = {...variant_aggs, ...subtypeAggs};
    }
    let aggs = {
        "aggs" :
        {
            "retailers" :
            {
                "terms" :
                {
                    "field" : "retailer_id",
                    "size" : 100
                }
            },
            "price_percentiles" :
            {
                "percentiles" :
                {
                    "field" : "price",
                    "percents" : ranges
                }
            },
            "variant_aggs" :
            {
                "nested" :
                {
                    "path" : "variants"
                },
                "aggs" :
                {
                    ...variant_aggs
                }
            }
        }
    };
    return aggs;
}