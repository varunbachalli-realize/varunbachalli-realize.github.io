class FilteringDisplay
{
    constructor(resultsManager, filtersElement){
        this.resultsManager = resultsManager;
        this.resultsManager.registerFilteringListener(this);
        this.getSearchQuery;
        this.onFiltersUpdated;
        this.onFiltersReset;
        this.filtersElement = filtersElement;
        this.rangeFilterButtons = {};
    }


    set getLatestSearchQuery(func)
    {
        this.getSearchQuery = func;
    }

    set updateFiltersFunc(func){
        this.onFiltersUpdated = func;
    }

    set resetFiltersFunc(func){
        this.onFiltersReset = func;
    }

    setAggregations(aggregations){
        this.showFilters(aggregations);
    }

    resetFilters(){
        if(this.onFiltersReset){
            this.onFiltersReset();
        }
    }

    onFilterSelected(){
        if(this.onFiltersUpdated){
            this.onFiltersUpdated();
        }
    }


    /// DISPLAYING FILTERS
    clearFilters()
    {
        let x = document.getElementsByClassName("filter-items");
        for (var i = 0; i < x.length; i++) 
        {
            x[i].parentNode.removeChild(x[i]);
        }
    }
    
    createResultsParent()
    {
        /*create a DIV element that will contain the items (values):*/
        let a = document.createElement("DIV");
        a.setAttribute("id","filters-list");
        a.setAttribute("class", "filter-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.filtersElement.appendChild(a);
        return a;
    }


    getSymbolFor(field){
        if(field == "price"){ return "$";}
        return "in";
    }

    createRangeFilters(min, max, field, parentDiv){
        let ranges = getRanges(min, max);
        const symbol = this.getSymbolFor(field);
        this.rangeFilterButtons[field] = [];
        for(let i = 0; i < ranges.length; ++i){
            let b = document.createElement("BUTTON");
            if(ranges[i][0] == 0){
                b.innerHTML= "Under  " + ranges[i][1] + symbol + "\n";
            }
            else if(ranges[i][1] == undefined){
                b.innerHTML= "Over  " + ranges[i][0] + symbol + "\n";
            }
            else{
                b.innerHTML= ranges[i][0] + symbol + ' - ' + ranges[i][1] + symbol + "\n";
            }
            b.buttonValue = {
                "on" : false,
                "type" : field,
                "value" : ranges[i]
            };
            b.className = 'button button1';
            b.addEventListener('click', (e)=> {
                                                this.toggleOtherButtons(e.toElement, field);                                                                
                                                this.hackyFiltering(e.toElement.buttonValue); 
                                             });
            parentDiv.appendChild(b);
            this.rangeFilterButtons[field].push(b);
        }
    }

    toggleOtherButtons(button, field){
        const allButtons = this.rangeFilterButtons[field];
        for(let i = 0; i < allButtons.length; ++i){
            if(allButtons[i]!= button && allButtons[i].buttonValue['on'])
            {
                toggleButtonClass(allButtons[i]);
            }
        }
        toggleButtonClass(button);
    }

    hackyFiltering(filterObject)
    {
        let searchQuery = this.getSearchQuery();
        if(filterObject['type'] == 'price')
        {
            if(filterObject['on'])
            {
                searchQuery.AddPriceFilter(filterObject['value'][0], filterObject['value'][1]);
            }
            else
            {
                searchQuery.RemovePriceFilter();
            }
        }
        else if(filterObject['type'] == 'height')
        {
            if(filterObject['on'])
            {
                searchQuery.AddHeightFilter(filterObject['value'][0], filterObject['value'][1]);
            }
            else
            {
                searchQuery.RemoveHeightFilter();
            }
        }
        else if(filterObject['type'] == 'width')
        {
            if(filterObject['on'])
            {
                searchQuery.AddWidthFilter(filterObject['value'][0], filterObject['value'][1]);
            }
            else
            {
                searchQuery.RemoveWidthFilter();
            }
        }
        else if(filterObject['type'] == 'depth')
        {
            if(filterObject['on'])
            {
                searchQuery.AddDepthFilter(filterObject['value'][0], filterObject['value'][1]);
            }
            else
            {
                searchQuery.RemoveDepthFilter();
            }
        }
        else if(filterObject['type'] == 'retailers')
        {
            if(filterObject['on'])
            {
                searchQuery.AddRetailerFilter(filterObject['value']);
            }
            else
            {
                searchQuery.RemoveRetailerFilter(filterObject['value']);
            }
        }
        else if(filterObject['type'] == 'subtypes')
        {
            if(filterObject['on'])
            {
                searchQuery.AddSubtypeFilter(filterObject['value']);
            }
            else
            {
                searchQuery.RemoveSubTypeFilter(filterObject['value']);
            }
        }
        this.onFiltersUpdated();
    }

    
    showFilters(aggregations){
        this.clearFilters();
        this.parentsDiv = this.createResultsParent();
        console.log(aggregations);
        for (const [key, value] of Object.entries(aggregations)) {
            let name = key;
            let b = document.createElement("DIV");
            b.innerHTML = name;
            if(name == 'price' || name == 'height' || name == 'width' || name == 'depth')
            {
                this.createRangeFilters(value.min, value.max, name, b);
            }
            else
            {
                for(let i = 0; i < value.length; ++i){
                    let id_button = document.createElement("BUTTON");
                    id_button.innerHTML = value[i];
                    console.log(key);
                    id_button.buttonValue = {
                        "type" : key,
                        "value" : value[i],
                        "on" : false
                    };
                    id_button.addEventListener('click', (e)=> {
                                                                toggleButtonClass(e.toElement);                                                                
                                                                this.hackyFiltering(e.toElement.buttonValue); 
                                                            });
                    id_button.className = 'button button1';
                    b.appendChild(id_button);
                }
            }

            this.parentsDiv.appendChild(b);
          }
    }
    
}

function toggleButtonClass(but){
    but.className == "button button1"? but.className = "button button2" : but.className = "button button1";
    but.buttonValue.on = !but.buttonValue.on;
}