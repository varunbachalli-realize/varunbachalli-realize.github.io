class AutoCompleteManager
{
    getRetailerAtIndex(entry, i)
    {
        if(i < entry.retailer.length)
            return entry.retailer[i];
        return null;
    }

    getSubTypeAtIndex(entry , i)
    {
        if(i < entry.subtype.length)
            return entry.subtype[i];
        return null;
    }

    constructor(resultsManager, num_direct_matches = 3, num_suggested_matches = 3)
    {
        this.resultsManager = resultsManager;
        this.numDirectMatches = num_direct_matches; 
        this.numSuggestedMatches = num_suggested_matches;
        this.client = new AutoCompleteServerCall();
        this.latestResults = [];
    }

    // you can call this without having to call the server. it'll retain the old results and then only highlight it.
    highlightExisting(input) 
    {
        for(let i = 0; i < this.latestResults.length; ++i)
        {
            this.latestResults[i].setText(input);
        }
    }

    getCategoryBasedSuggestions(results)
    {
        for(let i = 0; i < this.numDirectMatches; ++i)
        {
            if(i >= results.length) break;
            let entry = results[i];
            if(entry.suggestion_type == "type" || entry.suggestion_type == 'retailer')
            {
                let suggestionEntries = [];
                for(let j = 0; j < this.numSuggestedMatches; ++j)
                {
                    let subtypeText = this.getSubTypeAtIndex(entry, j);
                    if(subtypeText == null)
                    {
                        break;
                    }
                    let newSuggestionEntry = new SuggestionEntryWidget(
                        entry, 
                        this,
                        entry.suggestion_type == "type" ? AutoSuggestType.type : AutoSuggestType.retailer,
                        AutoSuggestType.subtype,
                        subtypeText);
                    suggestionEntries.push(newSuggestionEntry);
                }
                return suggestionEntries;
            }
        }
        return [];
    }

    getRetailerBasedSuggestions(results)
    {
        for(let i = 0; i < this.numDirectMatches; ++i)
        {
            if(i >= results.length) break;
            let entry = results[i];
            if(entry.suggestion_type == "subtype")
            {
                let suggestionEntries = [];
                for(let j = 0; j < this.numSuggestedMatches; ++j)
                {
                    let retailerText = this.getRetailerAtIndex(entry, j);
                    if(retailerText == null)
                    {
                        break;
                    }
                    let newSuggestionEntry = new SuggestionEntryWidget(
                        entry, 
                        this,
                        AutoSuggestType.subtype,
                        AutoSuggestType.retailer,
                        retailerText);
                    suggestionEntries.push(newSuggestionEntry);
                }
                return suggestionEntries;
            }
        }
        return [];
    }

    async instantiateNew(input, parentDiv)
    {
        this.latestResults = [];
        let results = await this.client.getAutoCompleteResultsFor(input);
        if(results == null) return;
        if(results.length==0)
        {
            return;
        }
        
        for(let i = 0; i < this.numDirectMatches; ++i)
        {
            if(i >= results.length) break;
            let matchedEntry = new MatchedEntryWidget(results[i], this);
            this.latestResults.push(matchedEntry);   
            parentDiv.appendChild(matchedEntry.getNode());
        }
        
        let suggestionEntries = this.getCategoryBasedSuggestions(results);
        for(let i = 0; i < suggestionEntries.length ; ++i)
        {
            if(i == 0)
            {
                let heading = document.createElement("DIV");
                heading.innerHTML = "<b> Categories </b>";
                parentDiv.appendChild(heading);
            }
            parentDiv.appendChild(suggestionEntries[i].getNode());
            this.latestResults.push(suggestionEntries[i]);
        }
        suggestionEntries = this.getRetailerBasedSuggestions(results);

        for(let i = 0; i < suggestionEntries.length ; ++i)
        {
            if(i == 0)
            {
                let heading = document.createElement("DIV");
                heading.innerHTML = "<b> Brands </b>";
                parentDiv.appendChild(heading);
            }
            parentDiv.appendChild(suggestionEntries[i].getNode());
            this.latestResults.push(suggestionEntries[i]);
        }

        this.highlightExisting(input);
    }

    onWidgetClicked(widget)
    {
        let queryGenerator = new AutoCompleteQueryGenerator(widget);
        this.resultsManager.setNewSearchQuery(queryGenerator);
    }

    onSearchButtonClicked(inputString)
    {
        let queryGenerator = new FreeTextSearchQueryGenerator(inputString);
        this.resultsManager.setNewSearchQuery(queryGenerator);
    }
}