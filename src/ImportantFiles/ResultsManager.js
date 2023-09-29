class ResultsManager
{
    constructor()
    {
        this.searchServer = new SearchServerCall();
        this.start = 0;
        this.count = 20;
        this.resultDisplay = null;
        this.filteringDisplay = null;
        this.searchQuery = null;
        this.currentTotal = 0;
        this.resultsUpdating = false;
    }

    getLatestSearchQuery(){
        return this.searchQuery;
    }

    async getSearchResults(start, count){
        let query = this.searchQuery.GenerateJson(start, count);
        let response = await this.searchServer.getSearchResultsFor(query);
        return response;
    }
    
    async getFilteringOptions(){
        let aggs = await this.searchServer.getAggregationResponseFor(this.searchQuery.GenerateAggregationJson());
        return aggs;
    }

    async setNewSearchQuery(searchQuery){
        this.start = 0;
        this.searchQuery = searchQuery;

        let aggregations = await this.getFilteringOptions();
        let searchResponse = await this.getSearchResults(this.start, this.count);
        

        this.updateResults(searchResponse);
        this.updateAggregations(aggregations);
    }

    registerResultsListener(resultsDisplay){
        this.resultsDisplay = resultsDisplay;
        this.resultsDisplay.requestNextPage = ()=>{return this.updateToNextPage()};
        this.resultsDisplay.requestPreviousPage = ()=>{this.updateToPreviousPage();}
    }

    registerFilteringListener(filteringDisplay){
        this.filteringDisplay = filteringDisplay;
        this.filteringDisplay.updateFiltersFunc = () =>{return this.onFiltersUpdated();};
        this.filteringDisplay.getLatestSearchQuery = () =>{return this.getLatestSearchQuery();};
        this.filteringDisplay.resetFiltersFunc = ()=>{return this.onFiltersReset;};
    }

    async onFiltersUpdated(){
        this.start = 0;
        let searchResult = await this.getSearchResults(this.start, this.count); 
        this.updateResults(searchResult);
    }

    async onFiltersReset(){
        this.searchQuery = this.searchQuery.CloneDefault();
        await this.onFiltersUpdated();
    }

    updateResults(results){
        this.resultsUpdating = true;

        this.currentTotal = results[1];
        if(this.resultsDisplay!= null){
            this.resultsDisplay.updateResults(results[0]);
        }

        this.resultsUpdating = false;
    }

    updateAggregations(aggregations){
        if(this.filteringDisplay != null){
            this.filteringDisplay.setAggregations(aggregations);
        }
    }

    async updateToNextPage(){
        if(this.resultsUpdating){
            return;
        }
        if(this.start + this.count >= this.currentTotal){
            // have already reached the last page.
            return;
        }

        this.start += this.count;
        let searchResult = await this.getSearchResults(this.start, this.count); 
        this.updateResults(searchResult);
    }

    async updateToPreviousPage(){
        if(this.resultsUpdating){
            return;
        }
        if(this.start - this.count < 0){
            // already at the first page.
            return;
        }
        
        this.start -= this.count;
        let searchResult = await this.getSearchResults(this.start, this.count); 
        this.updateResults(searchResult);
    }

}