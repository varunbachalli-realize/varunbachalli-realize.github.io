class AutoCompleteQueryGenerator extends SearchQueryGenerator
{
    GetSearchString() 
    {
        return this.widget.QueryText;
    }

    get IsMatchType() 
    {
        return this.widget instanceof MatchedEntryWidget;
    }

    constructor(widget)
    {
        super();
        this.widget = widget;
    }

    CloneDefault()
    {
        return new AutoCompleteQueryGenerator(this.widget);
    }

    GetMatchedEntryWidgetConditions(matchedWidget)
    {
        let conditions = [];
        if(matchedWidget.MatchType == AutoSuggestType.retailer)
        {
            conditions.push(GetRetailerMatchFilter(matchedWidget.MatchText));
        }
        else if (matchedWidget.MatchType == AutoSuggestType.item)
        {
            conditions = GetNameMatchFilter(matchedWidget.MatchText);
        }
        else if (matchedWidget.MatchType == AutoSuggestType.type || matchedWidget.MatchType == AutoSuggestType.subtype)
        {
            conditions.push(GetTypeOrSubTypeMatchFilter(matchedWidget.MatchType, matchedWidget.MatchText));
        }

        return conditions;
    }

    GetSuggestionEntryWidgetConditions(se)
    {
        let conditions = GetSimpleNameMatch(se.MatchedString);
        if (se.MatchType == AutoSuggestType.retailer && se.SuggestionType == AutoSuggestType.subtype)
        {
            console.log("retailer and subtype");
            conditions.push(GetTypeOrSubTypeMatchFilter(se.SuggestionType, se.SuggestionText));
            conditions.push(GetRetailerMatchFilter(se.MatchText));
        }

        else if (se.MatchType == AutoSuggestType.type && se.SuggestionType == AutoSuggestType.subtype)
        {
            console.log("type and subtype");
            conditions.push(GetSubTypeAndTypeMatchFilter(se.SuggestionText, se.MatchText));
        }

        else if (se.MatchType == AutoSuggestType.subtype && se.SuggestionType == AutoSuggestType.retailer)
        {
            console.log("subtype and retailer");
            conditions.push(GetTypeOrSubTypeMatchFilter(se.MatchType, se.MatchText));
            conditions.push(GetRetailerMatchFilter(se.SuggestionText));
        }

        return conditions;
    }


    GetAutoCompleteConditions()
    {
        if(this.widget instanceof MatchedEntryWidget)
        {
            console.log("basic");
            return this.GetMatchedEntryWidgetConditions(this.widget);
        }
        else if(this.widget instanceof SuggestionEntryWidget)
        {
            return this.GetSuggestionEntryWidgetConditions(this.widget);
        }
        return [];
    }

    GenerateBasicSearchObject()
    {
        let shouldConditions = this.GetAutoCompleteConditions();
        
        // TESTING !!
        // this.AddHeightFilter(0, 10);
        // this.AddLengthFilter(10, 20);
        // this.AddPriceFilter(10, Number.MAX_VALUE);
        // this.AddWidthFilter(10, Number.MAX_VALUE);
        // this.AddRetailerFilter(5);
        // this.AddRetailerFilter(6);
        // this.AddRetailerFilter(7);
        // this.AddRetailerFilter(6);
        // this.AddSubTypeFilter(3);
        // this.AddSubTypeFilter(5);
        // END TESTING!!
        let filterConditions = this.GetFilterConditions();
        

        let jsonObject = {
            "query" : {
                "bool" :{
                    "should" : shouldConditions,
                    "filter" : filterConditions
                }
            }
        };
        return jsonObject;
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
        console.log(JSON.stringify(json_object));
        return JSON.stringify(json_object);
    }
    GenerateAggregationJson()
    {
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
